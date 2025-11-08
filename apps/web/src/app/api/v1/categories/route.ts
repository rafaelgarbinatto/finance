import { NextRequest, NextResponse } from 'next/server';
import { createCategorySchema } from '@financas-a-dois/shared';
import { requireFamily, handleApiError, getIdempotencyKey } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await requireFamily();
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind');

    const categories = await prisma.category.findMany({
      where: {
        familyId: session.user.familyId!,
        ...(kind && { kind }),
      },
      orderBy: [
        { kind: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(
      categories.map(cat => ({
        ...cat,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireFamily();
    const body = await request.json();
    const data = createCategorySchema.parse(body);
    const idempotencyKey = getIdempotencyKey(request);

    // Check for duplicate category name
    const existing = await prisma.category.findUnique({
      where: {
        familyId_name_kind: {
          familyId: session.user.familyId!,
          name: data.name,
          kind: data.kind,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          type: 'https://httpstatuses.com/409',
          title: 'Conflict',
          status: 409,
          detail: 'Categoria já existe',
        },
        { 
          status: 409,
          headers: { 'Content-Type': 'application/problem+json' }
        }
      );
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        familyId: session.user.familyId!,
      },
    });

    return NextResponse.json(
      {
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
