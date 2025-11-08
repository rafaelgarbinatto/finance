import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Passthrough to NextAuth email callback
  const url = new URL('/api/auth/callback/email', request.url);
  
  // Copy all search params
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return NextResponse.redirect(url);
}
