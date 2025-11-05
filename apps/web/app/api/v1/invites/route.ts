import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createInviteSchema } from '@/lib/shared';
import { createProblem, generateUUID } from '@/lib/shared';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session.user.familyId) {
    return NextResponse.json(createProblem(401, 'Unauthorized'), { status: 401 });
  }

  if (session.user.role !== 'OWNER') {
    return NextResponse.json(
      createProblem(403, 'Forbidden', 'Only owners can create invites'),
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = createInviteSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        createProblem(409, 'Conflict', 'User already exists'),
        { status: 409 }
      );
    }

    const token = generateUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const invite = await prisma.invite.create({
      data: {
        email: data.email,
        token,
        role: data.role || 'PARTNER',
        familyId: session.user.familyId,
        expiresAt,
      },
    });

    const response = {
      token: invite.token,
      expires_at: invite.expiresAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Create invite error:', error);
    return NextResponse.json(
      createProblem(400, 'Bad Request', error.message),
      { status: 400 }
    );
  }
}
