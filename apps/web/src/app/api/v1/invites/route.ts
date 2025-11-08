import { NextRequest, NextResponse } from 'next/server';
import { createInviteSchema } from '@financas-a-dois/shared';
import { requireFamily, handleApiError, ApiError } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const session = await requireFamily();

    const invites = await prisma.invite.findMany({
      where: {
        familyId: session.user.familyId!,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      invites.map(invite => ({
        ...invite,
        expiresAt: invite.expiresAt.toISOString(),
        acceptedAt: invite.acceptedAt?.toISOString() || null,
        createdAt: invite.createdAt.toISOString(),
        updatedAt: invite.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireFamily();
    
    // Only OWNER can invite
    if (session.user.role !== 'OWNER') {
      throw new ApiError(403, 'Forbidden', 'Apenas o proprietário pode convidar membros');
    }

    const body = await request.json();
    const data = createInviteSchema.parse(body);

    // Generate token
    const token = randomBytes(32).toString('hex');
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.invite.create({
      data: {
        email: data.email,
        role: data.role,
        familyId: session.user.familyId!,
        token,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        ...invite,
        expiresAt: invite.expiresAt.toISOString(),
        acceptedAt: invite.acceptedAt?.toISOString() || null,
        createdAt: invite.createdAt.toISOString(),
        updatedAt: invite.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
