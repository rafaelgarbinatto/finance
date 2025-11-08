import { NextRequest, NextResponse } from 'next/server';
import { updateTransactionSchema } from '@financas-a-dois/shared';
import { requireFamily, handleApiError, ApiError, getIfMatch } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@financas-a-dois/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireFamily();
    
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
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

    if (!transaction) {
      throw new ApiError(404, 'Not Found', 'Transação não encontrada');
    }

    return NextResponse.json({
      id: transaction.id,
      amount: decimalToString(transaction.amount),
      kind: transaction.kind,
      categoryId: transaction.categoryId,
      note: transaction.note,
      date: transaction.date.toISOString(),
      userId: transaction.userId,
      familyId: transaction.familyId,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      category: transaction.category,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireFamily();
    const body = await request.json();
    const data = updateTransactionSchema.parse(body);
    const ifMatch = getIfMatch(request);

    // Get existing transaction
    const existing = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        familyId: session.user.familyId!,
      },
    });

    if (!existing) {
      throw new ApiError(404, 'Not Found', 'Transação não encontrada');
    }

    // RBAC: Only OWNER can edit any transaction, PARTNER can only edit their own
    if (session.user.role !== 'OWNER' && existing.userId !== session.user.id) {
      throw new ApiError(403, 'Forbidden', 'Você não tem permissão para editar esta transação');
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...(data.amount && { amount: parseFloat(data.amount) }),
        ...(data.kind && { kind: data.kind }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.note !== undefined && { note: data.note || null }),
        ...(data.date && { date: new Date(data.date) }),
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

    return NextResponse.json({
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
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireFamily();
    const ifMatch = getIfMatch(request);

    // Get existing transaction
    const existing = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        familyId: session.user.familyId!,
      },
    });

    if (!existing) {
      throw new ApiError(404, 'Not Found', 'Transação não encontrada');
    }

    // RBAC: Only OWNER can delete any transaction, PARTNER can only delete their own
    if (session.user.role !== 'OWNER' && existing.userId !== session.user.id) {
      throw new ApiError(403, 'Forbidden', 'Você não tem permissão para excluir esta transação');
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, request);
  }
}
