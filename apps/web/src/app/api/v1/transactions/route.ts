import { NextRequest, NextResponse } from 'next/server';
import { createTransactionSchema, transactionListQuerySchema } from '@financas-a-dois/shared';
import { requireFamily, handleApiError, getIdempotencyKey } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@financas-a-dois/shared';

export async function GET(request: NextRequest) {
  try {
    const session = await requireFamily();
    const { searchParams } = new URL(request.url);
    
    const query = transactionListQuerySchema.parse({
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || 20,
      kind: searchParams.get('kind') || undefined,
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        familyId: session.user.familyId!,
        ...(query.kind && { kind: query.kind }),
        ...(query.cursor && { id: { lt: query.cursor } }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            kind: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
      take: query.limit + 1,
    });

    const hasMore = transactions.length > query.limit;
    const data = hasMore ? transactions.slice(0, query.limit) : transactions;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return NextResponse.json({
      data: data.map(t => ({
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
        category: t.category,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireFamily();
    const body = await request.json();
    const data = createTransactionSchema.parse(body);
    const idempotencyKey = getIdempotencyKey(request);

    // Store idempotency key for duplicate prevention
    // In production, you'd want to use Redis or similar
    // For now, we'll just create the transaction

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(data.amount),
        kind: data.kind,
        categoryId: data.categoryId,
        note: data.note || null,
        date: new Date(data.date),
        userId: session.user.id,
        familyId: session.user.familyId!,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            kind: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: transaction.id,
        amount: formatCurrency(transaction.amount),
        kind: transaction.kind,
        categoryId: transaction.categoryId,
        note: transaction.note,
        date: transaction.date.toISOString(),
        userId: transaction.userId,
        familyId: transaction.familyId,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        category: transaction.category,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
