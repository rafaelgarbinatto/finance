import { NextRequest, NextResponse } from 'next/server';
import { magicLinkRequestSchema } from '@financas-a-dois/shared';
import { handleApiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, callbackUrl } = magicLinkRequestSchema.parse(body);

    // Trigger NextAuth email sign-in via redirect
    const url = new URL('/api/auth/signin/email', request.url);
    url.searchParams.set('email', email);
    if (callbackUrl) {
      url.searchParams.set('callbackUrl', callbackUrl);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, request);
  }
}
