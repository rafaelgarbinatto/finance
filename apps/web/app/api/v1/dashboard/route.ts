import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProblem, getCurrentMonth } from '@shared/utils';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || getCurrentMonth();

  // Parse month to get start and end dates
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  // Get all transactions for the month
  const transactions = await prisma.transaction.findMany({
    where: {
      familyId: session.user.familyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: {
        select: { name: true },
      },
    },
    orderBy: { date: 'desc' },
  });

  // Calculate totals
  let income = 0;
  let expense = 0;
  const categoryTotals: { [key: string]: { name: string; amount: number } } = {};

  transactions.forEach((t) => {
    const amount = parseFloat(t.amount.toString());
    if (t.type === 'INCOME') {
      income += amount;
    } else if (t.type === 'EXPENSE') {
      expense += amount;

      // Aggregate by category for expenses only
      const categoryName = t.category.name;
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { name: categoryName, amount: 0 };
      }
      categoryTotals[categoryName].amount += amount;
    }
  });

  const balance = income - expense;

  // Get top 5 expense categories
  const topCategories = Object.values(categoryTotals)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((c) => ({
      name: c.name,
      amount: c.amount.toFixed(2),
      percentage: expense > 0 ? Math.round((c.amount / expense) * 100) : 0,
    }));

  // Get 10 most recent transactions
  const recent = transactions.slice(0, 10).map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount.toFixed(2),
    category_id: t.categoryId,
    category_name: t.category.name,
    note: t.note,
    date: t.date.toISOString().split('T')[0],
    user_id: t.userId,
    family_id: t.familyId,
    version: t.version,
    created_at: t.createdAt.toISOString(),
  }));

  const response = {
    income: income.toFixed(2),
    expense: expense.toFixed(2),
    balance: balance.toFixed(2),
    top_categories: topCategories,
    recent,
  };

  return NextResponse.json(response);
}
