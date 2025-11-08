import { NextRequest, NextResponse } from 'next/server';
import { onboardingActivateSchema } from '@financas-a-dois/shared';
import { requireAuth, handleApiError, ApiError } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // User should not already be in a family
    if (session.user.familyId) {
      throw new ApiError(400, 'Bad Request', 'Você já está vinculado a uma família');
    }

    const body = await request.json();
    const data = onboardingActivateSchema.parse(body);

    // Create family
    const familyName = data.familyName || 'Minha Família';
    const family = await prisma.family.create({
      data: {
        name: familyName,
      },
    });

    // Update user to be OWNER of this family
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: 'OWNER',
        familyId: family.id,
      },
    });

    // Create default income categories
    const incomeCategories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Salário',
          kind: 'INCOME',
          familyId: family.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Freelance',
          kind: 'INCOME',
          familyId: family.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Investimentos',
          kind: 'INCOME',
          familyId: family.id,
        },
      }),
    ]);

    // Create default expense categories
    const expenseCategories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Alimentação',
          kind: 'EXPENSE',
          familyId: family.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Moradia',
          kind: 'EXPENSE',
          familyId: family.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Transporte',
          kind: 'EXPENSE',
          familyId: family.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Saúde',
          kind: 'EXPENSE',
          familyId: family.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Lazer',
          kind: 'EXPENSE',
          familyId: family.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Educação',
          kind: 'EXPENSE',
          familyId: family.id,
        },
      }),
    ]);

    // Create seed transactions for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = [
      // Income
      {
        amount: new Decimal('5500.00'),
        kind: 'INCOME',
        categoryId: incomeCategories[0].id,
        note: 'Salário mensal',
        date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 5),
        userId: session.user.id,
        familyId: family.id,
      },
      {
        amount: new Decimal('1200.00'),
        kind: 'INCOME',
        categoryId: incomeCategories[1].id,
        note: 'Projeto freelance',
        date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 10),
        userId: session.user.id,
        familyId: family.id,
      },
      // Expenses
      {
        amount: new Decimal('1200.00'),
        kind: 'EXPENSE',
        categoryId: expenseCategories[1].id,
        note: 'Aluguel',
        date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1),
        userId: session.user.id,
        familyId: family.id,
      },
      {
        amount: new Decimal('450.50'),
        kind: 'EXPENSE',
        categoryId: expenseCategories[0].id,
        note: 'Compras do mês',
        date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 3),
        userId: session.user.id,
        familyId: family.id,
      },
      {
        amount: new Decimal('200.00'),
        kind: 'EXPENSE',
        categoryId: expenseCategories[2].id,
        note: 'Gasolina',
        date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 4),
        userId: session.user.id,
        familyId: family.id,
      },
      {
        amount: new Decimal('150.00'),
        kind: 'EXPENSE',
        categoryId: expenseCategories[4].id,
        note: 'Cinema e restaurante',
        date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 7),
        userId: session.user.id,
        familyId: family.id,
      },
      {
        amount: new Decimal('80.00'),
        kind: 'EXPENSE',
        categoryId: expenseCategories[3].id,
        note: 'Farmácia',
        date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 8),
        userId: session.user.id,
        familyId: family.id,
      },
      {
        amount: new Decimal('320.00'),
        kind: 'EXPENSE',
        categoryId: expenseCategories[0].id,
        note: 'Restaurantes',
        date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 12),
        userId: session.user.id,
        familyId: family.id,
      },
    ];

    for (const transaction of transactions) {
      await prisma.transaction.create({ data: transaction });
    }

    return NextResponse.json(
      {
        familyId: family.id,
        familyName: family.name,
        message: 'Família criada e dados iniciais configurados com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
