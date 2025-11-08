import { NextRequest, NextResponse } from 'next/server';
import { requireFamily, handleApiError } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@financas-a-dois/shared';

export async function GET(request: NextRequest) {
  try {
    const session = await requireFamily();
    const { searchParams } = new URL(request.url);
    
    // Get current month by default or use provided date
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all transactions for the month
    const transactions = await prisma.transaction.findMany({
      where: {
        familyId: session.user.familyId!,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate aggregates
    let totalIncome = 0;
    let totalExpense = 0;

    const categoryTotals = new Map<string, { name: string; amount: number }>();

    for (const transaction of transactions) {
      if (transaction.kind === 'INCOME') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
        
        // Track expense categories for top categories
        const key = transaction.categoryId;
        const existing = categoryTotals.get(key);
        if (existing) {
          existing.amount += transaction.amount;
        } else {
          categoryTotals.set(key, {
            name: transaction.category.name,
            amount: transaction.amount,
          });
        }
      }
    }

    const balance = totalIncome - totalExpense;

    // Get top 5 expense categories
    const topCategories = Array.from(categoryTotals.entries())
      .map(([_, data]) => ({
        name: data.name,
        amount: data.amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(cat => ({
        name: cat.name,
        amount: formatCurrency(cat.amount),
        percentage: totalExpense === 0 ? 0 : (cat.amount / totalExpense) * 100,
      }));

    // Get recent 10 transactions
    const recentTransactions = transactions.slice(0, 10);

    return NextResponse.json({
      income: formatCurrency(totalIncome),
      expense: formatCurrency(totalExpense),
      balance: formatCurrency(balance),
      topCategories,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        amount: formatCurrency(t.amount),
        kind: t.kind,
        categoryId: t.categoryId,
        note: t.note,
        date: t.date.toISOString(),
        userId: t.userId,
        familyId: t.familyId,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        category: {
          id: t.category.id,
          name: t.category.name,
          kind: t.category.kind,
        },
      })),
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
