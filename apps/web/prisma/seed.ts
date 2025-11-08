import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create family
  const family = await prisma.family.create({
    data: {
      name: 'Rafael + Nine',
    },
  });
  console.log(`✅ Created family: ${family.name}`);

  // Create OWNER user
  const user = await prisma.user.create({
    data: {
      email: 'rafael@example.com',
      name: 'Rafael',
      role: 'OWNER',
      familyId: family.id,
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Create income categories
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
  console.log(`✅ Created ${incomeCategories.length} income categories`);

  // Create expense categories
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
  console.log(`✅ Created ${expenseCategories.length} expense categories`);

  // Get current month dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentDate = new Date();

  // Create income transactions for current month
  const incomeTransactions = [
    {
      amount: 5500.00,
      kind: 'INCOME',
      categoryId: incomeCategories[0].id, // Salário
      note: 'Salário mensal',
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 5),
      userId: user.id,
      familyId: family.id,
    },
    {
      amount: 1200.00,
      kind: 'INCOME',
      categoryId: incomeCategories[1].id, // Freelance
      note: 'Projeto freelance',
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 10),
      userId: user.id,
      familyId: family.id,
    },
  ];

  // Create expense transactions for current month
  const expenseTransactions = [
    {
      amount: 1200.00,
      kind: 'EXPENSE',
      categoryId: expenseCategories[1].id, // Moradia
      note: 'Aluguel',
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1),
      userId: user.id,
      familyId: family.id,
    },
    {
      amount: 450.50,
      kind: 'EXPENSE',
      categoryId: expenseCategories[0].id, // Alimentação
      note: 'Compras do mês',
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 3),
      userId: user.id,
      familyId: family.id,
    },
    {
      amount: 200.00,
      kind: 'EXPENSE',
      categoryId: expenseCategories[2].id, // Transporte
      note: 'Gasolina',
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 4),
      userId: user.id,
      familyId: family.id,
    },
    {
      amount: 150.00,
      kind: 'EXPENSE',
      categoryId: expenseCategories[4].id, // Lazer
      note: 'Cinema e restaurante',
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 7),
      userId: user.id,
      familyId: family.id,
    },
    {
      amount: 80.00,
      kind: 'EXPENSE',
      categoryId: expenseCategories[3].id, // Saúde
      note: 'Farmácia',
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 8),
      userId: user.id,
      familyId: family.id,
    },
    {
      amount: 320.00,
      kind: 'EXPENSE',
      categoryId: expenseCategories[0].id, // Alimentação
      note: 'Restaurantes',
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 12),
      userId: user.id,
      familyId: family.id,
    },
  ];

  const allTransactions = [...incomeTransactions, ...expenseTransactions];
  
  for (const transaction of allTransactions) {
    await prisma.transaction.create({ data: transaction });
  }
  
  console.log(`✅ Created ${allTransactions.length} transactions`);
  console.log(`   - Income: ${incomeTransactions.length}`);
  console.log(`   - Expense: ${expenseTransactions.length}`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
