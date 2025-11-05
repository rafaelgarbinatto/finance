import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { magicLinkSchema } from '@/lib/shared';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = magicLinkSchema.parse(body);

    await signIn('email', { email, redirect: false });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'Invalid request data',
      },
      { status: 400 }
    );
  }
}
