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

export async function DELETE(
  _request: Request,
  { params }: SpaceRouteContext,
): Promise<NextResponse> {
  const access = await requireAdmin(
    "Solo un administrador puede eliminar espacios.",
  );
  if ("response" in access) return access.response;

  const routeParams = await params;
  const idValidation = z.uuid().safeParse(routeParams.id);
  if (!idValidation.success) {
    return errorResponse(404, "SPACE_NOT_FOUND", "No se encontró el espacio.");
  }
  const id: string = idValidation.data ?? "";

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
        if (space.isActive) return { error: "SPACE_MUST_BE_INACTIVE" as const };

        const reservationCount = await transaction.count(reservationEntity, {
          space,
        });
        if (reservationCount > 0) {
          return { error: "SPACE_HAS_RESERVATIONS" as const };
        }

        transaction.remove(space);
        await transaction.flush();
        return { deleted: true as const, id };
      },
      { clear: true },
    );

    if ("error" in result) {
      if (result.error === "SPACE_NOT_FOUND") {
        return errorResponse(404, result.error, "No se encontró el espacio.");
      }
      if (result.error === "SPACE_MUST_BE_INACTIVE") {
        return errorResponse(
          409,
          result.error,
          "Desactiva el espacio antes de eliminarlo.",
        );
      }
      return errorResponse(
        409,
        "SPACE_HAS_RESERVATIONS",
        "No se puede eliminar un espacio con reservas registradas.",
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Could not delete space:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "No se pudo eliminar el espacio.",
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: SpaceRouteContext,
): Promise<NextResponse> {
  const access = await requireAdmin(
    "Solo un administrador puede actualizar espacios.",
  );
  if ("response" in access) return access.response;

  const routeParams = await params;
  const idValidation = z.uuid().safeParse(routeParams.id);
  if (!idValidation.success) {
    return errorResponse(404, "SPACE_NOT_FOUND", "No se encontró el espacio.");
  }
  const id: string = idValidation.data ?? "";

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
          id,
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
