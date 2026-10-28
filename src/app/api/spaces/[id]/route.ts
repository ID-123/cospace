import { LockMode } from "@mikro-orm/core";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  errorResponse,
  readValidatedBody,
  requireAdmin,
} from "@/features/auth/http";
import { spaceUpdateSchema } from "@/features/spaces/validation";
import type { Reservation } from "@/database/entities/reservation";
import type { Space } from "@/database/entities/space";
import { getEntityClass, getOrm } from "@/database/orm";

type SpaceRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: SpaceRouteContext,
): Promise<NextResponse> {
  const access = await requireAdmin(
    "Solo un administrador puede actualizar espacios.",
  );
  if ("response" in access) return access.response;

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return errorResponse(404, "SPACE_NOT_FOUND", "No se encontró el espacio.");
  }

  const input = await readValidatedBody(
    request,
    spaceUpdateSchema,
    "Revisa los datos del espacio.",
  );
  if ("response" in input) return input.response;

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const spaceEntity = getEntityClass<Space>(em, "Space");
    const reservationEntity = getEntityClass<Reservation>(em, "Reservation");
    const result = await em.transactional(
      async (transaction) => {
        const space = await transaction.findOne(
          spaceEntity,
          { id },
          { lockMode: LockMode.PESSIMISTIC_WRITE },
        );
        if (!space) return { error: "SPACE_NOT_FOUND" as const };

        if (input.data.isActive === false) {
          const futureReservation = await transaction.findOne(
            reservationEntity,
            {
              space,
              status: "confirmed",
              startsAt: { $gt: new Date() },
            },
          );
          if (futureReservation)
            return { error: "SPACE_HAS_FUTURE_RESERVATIONS" as const };
        }

        const { isActive, ...details } = input.data;
        transaction.assign(space, details);
        if (isActive !== undefined) space.isActive = isActive;
        await transaction.flush();
        return {
          id: space.id,
          name: space.name,
          description: space.description,
          type: space.type,
          capacity: space.capacity,
          pricePerHour: space.pricePerHour,
          isActive: space.isActive,
        };
      },
      { clear: true },
    );

    if ("error" in result) {
      if (result.error === "SPACE_NOT_FOUND") {
        return errorResponse(404, result.error, "No se encontró el espacio.");
      }
      return errorResponse(
        409,
        "SPACE_HAS_FUTURE_RESERVATIONS",
        "No se puede desactivar un espacio con reservas futuras confirmadas.",
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Could not update space:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "No se pudo actualizar el espacio.",
    );
  }
}
