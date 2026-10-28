import { connection, NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/features/auth/http";
import type { Space } from "@/database/entities/space";
import { getEntityClass, getOrm } from "@/database/orm";

export async function GET(): Promise<NextResponse> {
  await connection();
  const access = await requireAdmin(
    "Solo un administrador puede gestionar espacios.",
  );
  if ("response" in access) return access.response;

  try {
    const orm = await getOrm();
    const em = orm.em.fork();

    const spaceEntity = getEntityClass<Space>(em, "Space");
    const spaces = await em.find(spaceEntity, {}, { orderBy: { name: "ASC" } });

    return NextResponse.json(
      spaces.map((space) => ({
        id: space.id,
        name: space.name,
        description: space.description,
        type: space.type,
        capacity: space.capacity,
        pricePerHour: space.pricePerHour,
        isActive: space.isActive,
      })),
    );
  } catch (error) {
    console.error("Could not load spaces for admin:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "No se pudieron consultar los espacios.",
    );
  }
}
