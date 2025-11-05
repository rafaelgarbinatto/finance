import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCategorySchema } from '@shared/schemas';
import { createProblem } from '@shared/utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json(createProblem(403, 'Forbidden', 'Only owners can update categories'), {
      status: 403,
    });
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
    const data = updateCategorySchema.parse(body);

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category || category.familyId !== session.user.familyId) {
      return NextResponse.json(createProblem(404, 'Not Found'), { status: 404 });
    }

    const expectedVersion = parseInt(ifMatch.replace(/"/g, ''), 10);
    if (category.version !== expectedVersion) {
      return NextResponse.json(
        createProblem(412, 'Precondition Failed', 'Version mismatch'),
        { status: 412 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });

    const response = {
      id: updated.id,
      name: updated.name,
      kind: updated.kind,
      family_id: updated.familyId,
      version: updated.version,
    };

    return NextResponse.json(response, {
      headers: {
        ETag: `"${updated.version}"`,
      },
    });
  } catch (error: any) {
    console.error('Update category error:', error);
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

  if (session.user.role !== 'OWNER') {
    return NextResponse.json(createProblem(403, 'Forbidden', 'Only owners can delete categories'), {
      status: 403,
    });
  }

  const ifMatch = request.headers.get('if-match');
  if (!ifMatch) {
    return NextResponse.json(
      createProblem(428, 'Precondition Required', 'If-Match header required'),
      { status: 428 }
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category || category.familyId !== session.user.familyId) {
      return NextResponse.json(createProblem(404, 'Not Found'), { status: 404 });
    }

    const expectedVersion = parseInt(ifMatch.replace(/"/g, ''), 10);
    if (category.version !== expectedVersion) {
      return NextResponse.json(
        createProblem(412, 'Precondition Failed', 'Version mismatch'),
        { status: 412 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      createProblem(400, 'Bad Request', error.message),
      { status: 400 }
    );
  }
}
