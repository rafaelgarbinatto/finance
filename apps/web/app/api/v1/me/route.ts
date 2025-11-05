import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      familyId: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: 'User not found',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    family_id: user.familyId,
  });
}
