import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { ProblemTypes } from '@financas-a-dois/shared';
import { ZodError } from 'zod';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new ApiError(401, 'Unauthorized', 'Você precisa estar autenticado');
  }
  return session;
}

export async function requireFamily() {
  const session = await requireAuth();
  if (!session.user.familyId) {
    throw new ApiError(403, 'Forbidden', 'Você precisa estar vinculado a uma família');
  }
  return session;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail?: string
  ) {
    super(detail || title);
  }
}

export function handleApiError(error: unknown, request?: NextRequest) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    const problem = ProblemTypes.BAD_REQUEST(error.detail, request?.url);
    problem.status = error.status;
    problem.title = error.title;
    return NextResponse.json(problem, { 
      status: error.status,
      headers: { 'Content-Type': 'application/problem+json' }
    });
  }

  if (error instanceof ZodError) {
    const problem = ProblemTypes.UNPROCESSABLE_ENTITY(
      error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      request?.url
    );
    return NextResponse.json(problem, { 
      status: 422,
      headers: { 'Content-Type': 'application/problem+json' }
    });
  }

  const problem = ProblemTypes.INTERNAL_SERVER_ERROR(
    'Ocorreu um erro interno',
    request?.url
  );
  return NextResponse.json(problem, { 
    status: 500,
    headers: { 'Content-Type': 'application/problem+json' }
  });
}

export function getIdempotencyKey(request: NextRequest): string | null {
  return request.headers.get('Idempotency-Key');
}

export function getIfMatch(request: NextRequest): string | null {
  return request.headers.get('If-Match');
}

export function generateETag(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `"${Math.abs(hash).toString(36)}"`;
}
