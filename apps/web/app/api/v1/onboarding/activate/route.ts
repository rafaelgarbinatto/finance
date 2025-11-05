import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProblem } from '@/lib/shared';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json(createProblem(404, 'Not Found'), { status: 404 });
  }

  if (user.familyId) {
    return NextResponse.json(
      createProblem(409, 'Conflict', 'User already has a family'),
      { status: 409 }
    );
  }

  try {
    // Create family
    const family = await prisma.family.create({
      data: {
        name: user.name || user.email,
      },
    });

    // Create setting
    await prisma.setting.create({
      data: {
        familyId: family.id,
        currency: 'BRL',
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'OWNER',
        familyId: family.id,
      },
    });

    // Create income categories
    const incomeCategories = ['Salário', 'Outros'];
    const createdIncomeCategories = [];

    for (const name of incomeCategories) {
      const category = await prisma.category.create({
        data: {
          name,
          kind: 'INCOME',
          familyId: family.id,
        },
      });
      createdIncomeCategories.push(category);
    }

    // Create expense categories
    const expenseCategories = [
      'Cartão',
      'Casa',
      'Carro',
      'Limpeza',
      'Internet/Telefone',
      'Clube',
      'Condomínio',
      'Mercado',
      'Restaurante',
      'Saúde',
      'Lazer',
      'Outros',
    ];
    const createdExpenseCategories = [];

    for (const name of expenseCategories) {
      const category = await prisma.category.create({
        data: {
          name,
          kind: 'EXPENSE',
          familyId: family.id,
        },
      });
      createdExpenseCategories.push(category);
    }

    // Create seed transactions for current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const salarioCategory = createdIncomeCategories.find((c) => c.name === 'Salário');
    const outrosIncomeCategory = createdIncomeCategories.find((c) => c.name === 'Outros');
    const cartaoCategory = createdExpenseCategories.find((c) => c.name === 'Cartão');
    const casaCategory = createdExpenseCategories.find((c) => c.name === 'Casa');
    const carroCategory = createdExpenseCategories.find((c) => c.name === 'Carro');
    const limpezaCategory = createdExpenseCategories.find((c) => c.name === 'Limpeza');
    const outrosExpenseCategory = createdExpenseCategories.find((c) => c.name === 'Outros');
    const internetCategory = createdExpenseCategories.find((c) => c.name === 'Internet/Telefone');
    const clubeCategory = createdExpenseCategories.find((c) => c.name === 'Clube');
    const condominioCategory = createdExpenseCategories.find((c) => c.name === 'Condomínio');

    const seedTransactions = [
      // Income
      {
        type: 'INCOME',
        amount: 21150,
        categoryId: salarioCategory!.id,
        note: 'Salário Rafael',
        date: new Date(year, month, 5),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'INCOME',
        amount: 750,
        categoryId: salarioCategory!.id,
        note: 'Salário Nine',
        date: new Date(year, month, 10),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'INCOME',
        amount: 250,
        categoryId: outrosIncomeCategory!.id,
        note: 'Amiga',
        date: new Date(year, month, 15),
        userId: user.id,
        familyId: family.id,
      },
      // Expenses
      {
        type: 'EXPENSE',
        amount: 11037,
        categoryId: cartaoCategory!.id,
        note: 'Cartão venc 10',
        date: new Date(year, month, 10),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'EXPENSE',
        amount: 3700,
        categoryId: casaCategory!.id,
        note: 'Aluguel',
        date: new Date(year, month, 5),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'EXPENSE',
        amount: 4400,
        categoryId: carroCategory!.id,
        note: 'Parcela carro',
        date: new Date(year, month, 8),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'EXPENSE',
        amount: 1260,
        categoryId: limpezaCategory!.id,
        note: 'Iraci',
        date: new Date(year, month, 12),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'EXPENSE',
        amount: 560,
        categoryId: outrosExpenseCategory!.id,
        note: 'Marta',
        date: new Date(year, month, 12),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'EXPENSE',
        amount: 260,
        categoryId: internetCategory!.id,
        note: 'Cel/Internet',
        date: new Date(year, month, 15),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'EXPENSE',
        amount: 450,
        categoryId: clubeCategory!.id,
        note: 'Clube',
        date: new Date(year, month, 20),
        userId: user.id,
        familyId: family.id,
      },
      {
        type: 'EXPENSE',
        amount: 500,
        categoryId: condominioCategory!.id,
        note: 'Condomínio',
        date: new Date(year, month, 25),
        userId: user.id,
        familyId: family.id,
      },
    ];

    for (const data of seedTransactions) {
      await prisma.transaction.create({ data });
    }

    return NextResponse.json({
      success: true,
      family_id: family.id,
    });
  } catch (error: any) {
    console.error('Onboarding activation error:', error);
    return NextResponse.json(
      createProblem(500, 'Internal Server Error', error.message),
      { status: 500 }
    );
  }
}
