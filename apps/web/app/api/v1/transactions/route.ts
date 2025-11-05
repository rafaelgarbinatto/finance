import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTransactionSchema, transactionTypeSchema } from '@shared/schemas';
import { createProblem } from '@shared/utils';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const cursor = searchParams.get('cursor');

  const where: any = {
    familyId: session.user.familyId,
  };

  if (type) {
    const parsed = transactionTypeSchema.safeParse(type.toUpperCase());
    if (parsed.success) {
      where.type = parsed.data;
    }
  }

  if (cursor) {
    where.id = { lt: cursor };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: {
        select: { name: true },
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: limit + 1,
  });

  const hasMore = transactions.length > limit;
  const items = hasMore ? transactions.slice(0, -1) : transactions;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  const response = {
    items: items.map((t) => ({
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
    })),
    next_cursor: nextCursor,
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  const idempotencyKey = request.headers.get('idempotency-key');

  try {
    const body = await request.json();
    const data = createTransactionSchema.parse(body);

    // Check category exists and belongs to family
    const category = await prisma.category.findUnique({
      where: { id: data.category_id },
    });

    if (!category || category.familyId !== session.user.familyId) {
      return NextResponse.json(
        createProblem(400, 'Bad Request', 'Invalid category'),
        { status: 400 }
      );
    }

    // Check for idempotent request
    if (idempotencyKey) {
      const existing = await prisma.transaction.findFirst({
        where: {
          familyId: session.user.familyId,
          userId: session.user.id,
          id: idempotencyKey,
        },
        include: {
          category: {
            select: { name: true },
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            id: existing.id,
            type: existing.type,
            amount: existing.amount.toFixed(2),
            category_id: existing.categoryId,
            category_name: existing.category.name,
            note: existing.note,
            date: existing.date.toISOString().split('T')[0],
            user_id: existing.userId,
            family_id: existing.familyId,
            version: existing.version,
            created_at: existing.createdAt.toISOString(),
          },
          { status: 200 }
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        id: idempotencyKey || undefined,
        type: data.type,
        amount: data.amount,
        categoryId: data.category_id,
        note: data.note,
        date: data.date ? new Date(data.date) : new Date(),
        userId: session.user.id,
        familyId: session.user.familyId,
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    const response = {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toFixed(2),
      category_id: transaction.categoryId,
      category_name: transaction.category.name,
      note: transaction.note,
      date: transaction.date.toISOString().split('T')[0],
      user_id: transaction.userId,
      family_id: transaction.familyId,
      version: transaction.version,
      created_at: transaction.createdAt.toISOString(),
    };

    return NextResponse.json(response, {
      status: 201,
      headers: {
        ETag: `"${transaction.version}"`,
      },
    });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      createProblem(400, 'Bad Request', error.message),
      { status: 400 }
    );
  }
}
