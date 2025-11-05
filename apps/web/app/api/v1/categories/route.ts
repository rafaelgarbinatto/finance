import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCategorySchema, categoryKindSchema } from '@/lib/shared';
import { createProblem } from '@/lib/shared';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind');
  const search = searchParams.get('search');

  const where: any = {
    familyId: session.user.familyId,
  };

  if (kind) {
    const parsed = categoryKindSchema.safeParse(kind.toUpperCase());
    if (parsed.success) {
      where.kind = parsed.data;
    }
  }

  if (search) {
    where.name = {
      contains: search,
    };
  }

  const categories = await prisma.category.findMany({
    where,
    select: {
      id: true,
      name: true,
      kind: true,
      familyId: true,
      version: true,
    },
    orderBy: { name: 'asc' },
  });

  const response = categories.map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.kind,
    family_id: c.familyId,
    version: c.version,
  }));

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json(createProblem(403, 'Forbidden', 'Only owners can create categories'), {
      status: 403,
    });
  }

  try {
    const body = await request.json();
    const data = createCategorySchema.parse(body);

    // Check for duplicate
    const existing = await prisma.category.findFirst({
      where: {
        familyId: session.user.familyId,
        name: data.name,
        kind: data.kind,
      },
    });

    if (existing) {
      return NextResponse.json(
        createProblem(409, 'Conflict', 'Category already exists'),
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        kind: data.kind,
        familyId: session.user.familyId,
      },
    });

    const response = {
      id: category.id,
      name: category.name,
      kind: category.kind,
      family_id: category.familyId,
      version: category.version,
    };

    return NextResponse.json(response, {
      status: 201,
      headers: {
        ETag: `"${category.version}"`,
      },
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      createProblem(400, 'Bad Request', error.message),
      { status: 400 }
    );
  }
}
