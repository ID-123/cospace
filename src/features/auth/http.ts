import { NextResponse } from 'next/server';
import { credentialsSchema } from '@/features/auth/validation';

type Credentials = {
  email: string;
  password: string;
};

export function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function readCredentials(
  request: Request,
): Promise<Credentials | null> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return null;
  }

  const result = credentialsSchema.safeParse(body);
  return result.success ? result.data : null;
}
