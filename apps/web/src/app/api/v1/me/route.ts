import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      familyId: session.user.familyId,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
