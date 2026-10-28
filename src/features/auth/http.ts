import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { getAuthenticatedUser } from "@/features/auth/current-user";
import { credentialsSchema } from "@/features/auth/validation";
import type { User } from "@/database/entities/user";

type Credentials = {
  email: string;
  password: string;
};

type UserAccess = { user: User } | { response: NextResponse };

type ValidatedBody<T> = { data: T } | { response: NextResponse };

export function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function requireUser(
  logContext = "authenticate request",
): Promise<UserAccess> {
  try {
    const user = await getAuthenticatedUser();
    if (user) return { user };
  } catch (error) {
    console.error(`Could not ${logContext}:`, error);
    return {
      response: errorResponse(
        500,
        "INTERNAL_ERROR",
        "No se pudo verificar la sesión.",
      ),
    };
  }

  return {
    response: errorResponse(401, "UNAUTHENTICATED", "Inicia sesión."),
  };
}

export async function requireAdmin(
  forbiddenMessage = "Solo un administrador puede realizar esta acción.",
): Promise<UserAccess> {
  const access = await requireUser();
  if ("response" in access) return access;
  if (access.user.role !== "admin") {
    return { response: errorResponse(403, "FORBIDDEN", forbiddenMessage) };
  }
  return access;
}

export async function readValidatedBody<T>(
  request: Request,
  schema: ZodType<T>,
  invalidMessage = "Revisa los datos enviados.",
): Promise<ValidatedBody<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: errorResponse(400, "INVALID_INPUT", invalidMessage) };
  }

  const validation = schema.safeParse(body);
  if (!validation.success) {
    return {
      response: errorResponse(
        400,
        "INVALID_INPUT",
        validation.error.issues[0]?.message ?? invalidMessage,
      ),
    };
  }
  return { data: validation.data };
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
