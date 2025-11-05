import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create family
  const family = await prisma.family.create({
    data: {
      name: 'Rafael + Nine',
    },
  });

  console.log('Created family:', family.name);

  // Create owner user
  const owner = await prisma.user.create({
    data: {
      email: 'rafael@example.com',
      name: 'Rafael',
      role: 'OWNER',
      familyId: family.id,
    },
  });

  console.log('Created owner user:', owner.email);

  // Create setting
  await prisma.setting.create({
    data: {
      familyId: family.id,
      currency: 'BRL',
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

  console.log('Created income categories:', createdIncomeCategories.length);

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

  console.log('Created expense categories:', createdExpenseCategories.length);

  // Get current month info
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Create income transactions
  const salarioCategory = createdIncomeCategories.find(c => c.name === 'Salário');
  const outrosIncomeCategory = createdIncomeCategories.find(c => c.name === 'Outros');

  const incomeTransactions = [
    {
      type: 'INCOME',
      amount: 21150,
      categoryId: salarioCategory!.id,
      note: 'Salário Rafael',
      date: new Date(year, month, 5),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'INCOME',
      amount: 750,
      categoryId: salarioCategory!.id,
      note: 'Salário Nine',
      date: new Date(year, month, 10),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'INCOME',
      amount: 250,
      categoryId: outrosIncomeCategory!.id,
      note: 'Amiga',
      date: new Date(year, month, 15),
      userId: owner.id,
      familyId: family.id,
    },
  ];

  for (const data of incomeTransactions) {
    await prisma.transaction.create({ data });
  }

  console.log('Created income transactions:', incomeTransactions.length);

  // Create expense transactions
  const cartaoCategory = createdExpenseCategories.find(c => c.name === 'Cartão');
  const casaCategory = createdExpenseCategories.find(c => c.name === 'Casa');
  const carroCategory = createdExpenseCategories.find(c => c.name === 'Carro');
  const limpezaCategory = createdExpenseCategories.find(c => c.name === 'Limpeza');
  const outrosExpenseCategory = createdExpenseCategories.find(c => c.name === 'Outros');
  const internetCategory = createdExpenseCategories.find(c => c.name === 'Internet/Telefone');
  const clubeCategory = createdExpenseCategories.find(c => c.name === 'Clube');
  const condominioCategory = createdExpenseCategories.find(c => c.name === 'Condomínio');

  const expenseTransactions = [
    {
      type: 'EXPENSE',
      amount: 11037,
      categoryId: cartaoCategory!.id,
      note: 'Cartão venc 10',
      date: new Date(year, month, 10),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'EXPENSE',
      amount: 3700,
      categoryId: casaCategory!.id,
      note: 'Aluguel',
      date: new Date(year, month, 5),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'EXPENSE',
      amount: 4400,
      categoryId: carroCategory!.id,
      note: 'Parcela carro',
      date: new Date(year, month, 8),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'EXPENSE',
      amount: 1260,
      categoryId: limpezaCategory!.id,
      note: 'Iraci',
      date: new Date(year, month, 12),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'EXPENSE',
      amount: 560,
      categoryId: outrosExpenseCategory!.id,
      note: 'Marta',
      date: new Date(year, month, 12),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'EXPENSE',
      amount: 260,
      categoryId: internetCategory!.id,
      note: 'Cel/Internet',
      date: new Date(year, month, 15),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'EXPENSE',
      amount: 450,
      categoryId: clubeCategory!.id,
      note: 'Clube',
      date: new Date(year, month, 20),
      userId: owner.id,
      familyId: family.id,
    },
    {
      type: 'EXPENSE',
      amount: 500,
      categoryId: condominioCategory!.id,
      note: 'Condomínio',
      date: new Date(year, month, 25),
      userId: owner.id,
      familyId: family.id,
    },
  ];

  for (const data of expenseTransactions) {
    await prisma.transaction.create({ data });
  }

  console.log('Created expense transactions:', expenseTransactions.length);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
