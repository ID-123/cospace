import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { getEntityClass, getOrm } from "@/database/orm";
import type { User } from "@/database/entities/user";
import { hashPassword } from "@/features/auth/password";
import { createSession, setSessionCookies } from "@/features/auth/session";
import { registrationSchema } from "@/features/auth/validation";
import { errorResponse } from "@/features/auth/http";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      "INVALID_INPUT",
      "Revisa los datos del formulario.",
    );
  }

  const validation = registrationSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      400,
      "INVALID_INPUT",
      validation.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    );
  }

  const credentials = validation.data;

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const userEntity = getEntityClass<User>(em, "User");
    const registration = await em.transactional(async (transaction) => {
      const existingUser = await transaction.findOne(userEntity, {
        email: credentials.email,
      });
      if (existingUser) return null;

      const user = transaction.create(userEntity, {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        phone: credentials.phone,
        email: credentials.email,
        passwordHash: await hashPassword(credentials.password),
        role: "user",
        isActive: true,
      });
      transaction.persist(user);

      const tokens = await createSession(transaction, user);
      return { user, tokens };
    });

    if (!registration) {
      return errorResponse(
        409,
        "EMAIL_IN_USE",
        "El correo ya está registrado.",
      );
    }

    const response = NextResponse.json(
      {
        user: {
          id: registration.user.id,
          firstName: registration.user.firstName,
          lastName: registration.user.lastName,
          email: registration.user.email,
          role: registration.user.role,
        },
      },
      { status: 201 },
    );
    setSessionCookies(response, registration.tokens);
    return response;
  } catch (error) {
    if (error instanceof UniqueConstraintViolationException) {
      try {
        const em = (await getOrm()).em.fork();
        const userEntity = getEntityClass<User>(em, "User");
        const existingUser = await em.findOne(userEntity, {
          email: credentials.email,
        });
        if (existingUser) {
          return errorResponse(
            409,
            "EMAIL_IN_USE",
            "El correo ya está registrado.",
          );
        }
      } catch (lookupError) {
        console.error("Could not verify duplicate registration:", lookupError);
      }
    }

    console.error("Registration failed:", error);
    return errorResponse(500, "INTERNAL_ERROR", "No se pudo crear la cuenta.");
  }
}
