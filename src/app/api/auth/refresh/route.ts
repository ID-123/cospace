import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { errorResponse } from "@/features/auth/http";
import {
  createAccessToken,
  REFRESH_COOKIE,
  REFRESH_TOKEN_SECONDS,
} from "@/features/auth/token";
import {
  clearSessionCookies,
  hashRefreshToken,
  setSessionCookies,
  verifyRefreshToken,
} from "@/features/auth/session";
import type { RefreshToken } from "@/database/entities/user";
import { getEntityClass, getOrm } from "@/database/orm";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    const response = errorResponse(401, "UNAUTHENTICATED", "Inicia sesión.");
    clearSessionCookies(response);
    return response;
  }

  const refreshUserId = await verifyRefreshToken(refreshToken);
  if (!refreshUserId) {
    const response = errorResponse(401, "UNAUTHENTICATED", "Inicia sesión.");
    clearSessionCookies(response);
    return response;
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const refreshTokenEntity = getEntityClass<RefreshToken>(em, "RefreshToken");
    const tokenRecord = await em.findOne(
      refreshTokenEntity,
      { tokenHash: hashRefreshToken(refreshToken) },
      { populate: ["user"] },
    );

    if (
      !tokenRecord ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt <= new Date() ||
      tokenRecord.user.id !== refreshUserId ||
      !tokenRecord.user.isActive
    ) {
      if (tokenRecord && !tokenRecord.revokedAt) {
        tokenRecord.revokedAt = new Date();
        await em.flush();
      }

      const response = errorResponse(401, "UNAUTHENTICATED", "Inicia sesión.");
      clearSessionCookies(response);
      return response;
    }

    tokenRecord.expiresAt = new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000);
    const accessToken = await createAccessToken({
      id: tokenRecord.user.id,
      firstName: tokenRecord.user.firstName,
      lastName: tokenRecord.user.lastName,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
    });
    await em.flush();
    const response = NextResponse.json({ refreshed: true });
    setSessionCookies(response, { accessToken, refreshToken });
    return response;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "No se pudo renovar la sesión.",
    );
  }
}
