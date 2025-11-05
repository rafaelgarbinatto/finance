import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateTransactionSchema } from '@/lib/shared';
import { createProblem } from '@/lib/shared';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  const ifMatch = request.headers.get('if-match');
  if (!ifMatch) {
    return NextResponse.json(
      createProblem(428, 'Precondition Required', 'If-Match header required'),
      { status: 428 }
    );
  }

  try {
    const body = await request.json();
    const data = updateTransactionSchema.parse(body);

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction || transaction.familyId !== session.user.familyId) {
      return NextResponse.json(createProblem(404, 'Not Found'), { status: 404 });
    }

    // PARTNER can only edit their own transactions
    if (session.user.role === 'PARTNER' && transaction.userId !== session.user.id) {
      return NextResponse.json(
        createProblem(403, 'Forbidden', 'Partners can only edit their own transactions'),
        { status: 403 }
      );
    }

    const expectedVersion = parseInt(ifMatch.replace(/"/g, ''), 10);
    if (transaction.version !== expectedVersion) {
      return NextResponse.json(
        createProblem(412, 'Precondition Failed', 'Version mismatch'),
        { status: 412 }
      );
    }

    // Validate category if provided
    if (data.category_id) {
      const category = await prisma.category.findUnique({
        where: { id: data.category_id },
      });

      if (!category || category.familyId !== session.user.familyId) {
        return NextResponse.json(
          createProblem(400, 'Bad Request', 'Invalid category'),
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      version: { increment: 1 },
    };

    if (data.type) updateData.type = data.type;
    if (data.amount) updateData.amount = parseFloat(data.amount);
    if (data.category_id) updateData.categoryId = data.category_id;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.date) updateData.date = new Date(data.date);

    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    const response = {
      id: updated.id,
      type: updated.type,
      amount: updated.amount.toFixed(2),
      category_id: updated.categoryId,
      category_name: updated.category.name,
      note: updated.note,
      date: updated.date.toISOString().split('T')[0],
      user_id: updated.userId,
      family_id: updated.familyId,
      version: updated.version,
      created_at: updated.createdAt.toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        ETag: `"${updated.version}"`,
      },
    });
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      createProblem(400, 'Bad Request', error.message),
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  const ifMatch = request.headers.get('if-match');
  if (!ifMatch) {
    return NextResponse.json(
      createProblem(428, 'Precondition Required', 'If-Match header required'),
      { status: 428 }
    );
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction || transaction.familyId !== session.user.familyId) {
      return NextResponse.json(createProblem(404, 'Not Found'), { status: 404 });
    }

    // PARTNER can only delete their own transactions
    if (session.user.role === 'PARTNER' && transaction.userId !== session.user.id) {
      return NextResponse.json(
        createProblem(403, 'Forbidden', 'Partners can only delete their own transactions'),
        { status: 403 }
      );
    }

    const expectedVersion = parseInt(ifMatch.replace(/"/g, ''), 10);
    if (transaction.version !== expectedVersion) {
      return NextResponse.json(
        createProblem(412, 'Precondition Failed', 'Version mismatch'),
        { status: 412 }
      );
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      createProblem(400, 'Bad Request', error.message),
      { status: 400 }
    );
  }
}
