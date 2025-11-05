import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { acceptInviteSchema } from '@shared/schemas';
import { createProblem } from '@shared/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = acceptInviteSchema.parse(body);

    const invite = await prisma.invite.findUnique({
      where: { token: data.token },
      include: { family: true },
    });

    if (!invite) {
      return NextResponse.json(
        createProblem(404, 'Not Found', 'Invite not found'),
        { status: 404 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        createProblem(410, 'Gone', 'Invite has expired'),
        { status: 410 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      return NextResponse.json(
        createProblem(409, 'Conflict', 'User already exists'),
        { status: 409 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: invite.email,
        name: data.name,
        role: invite.role,
        familyId: invite.familyId,
      },
    });

    // Delete invite
    await prisma.invite.delete({
      where: { id: invite.id },
    });

    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        family_id: user.familyId,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      createProblem(400, 'Bad Request', error.message),
      { status: 400 }
    );
  }
}
