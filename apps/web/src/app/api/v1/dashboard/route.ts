import { NextRequest, NextResponse } from 'next/server';
import { requireFamily, handleApiError } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { decimalToString } from '@financas-a-dois/shared';
import { Decimal } from '@prisma/client/runtime/library';

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
    let totalIncome = new Decimal(0);
    let totalExpense = new Decimal(0);

    const categoryTotals = new Map<string, { name: string; amount: Decimal }>();

    for (const transaction of transactions) {
      if (transaction.kind === 'INCOME') {
        totalIncome = totalIncome.add(transaction.amount);
      } else {
        totalExpense = totalExpense.add(transaction.amount);
        
        // Track expense categories for top categories
        const key = transaction.categoryId;
        const existing = categoryTotals.get(key);
        if (existing) {
          existing.amount = existing.amount.add(transaction.amount);
        } else {
          categoryTotals.set(key, {
            name: transaction.category.name,
            amount: transaction.amount,
          });
        }
      }
    }

    const balance = totalIncome.sub(totalExpense);

    // Get top 5 expense categories
    const topCategories = Array.from(categoryTotals.entries())
      .map(([_, data]) => ({
        name: data.name,
        amount: data.amount,
      }))
      .sort((a, b) => b.amount.comparedTo(a.amount))
      .slice(0, 5)
      .map(cat => ({
        name: cat.name,
        amount: decimalToString(cat.amount),
        percentage: totalExpense.isZero() ? 0 : cat.amount.div(totalExpense).mul(100).toNumber(),
      }));

    // Get recent 10 transactions
    const recentTransactions = transactions.slice(0, 10);

    return NextResponse.json({
      income: decimalToString(totalIncome),
      expense: decimalToString(totalExpense),
      balance: decimalToString(balance),
      topCategories,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        amount: decimalToString(t.amount),
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
