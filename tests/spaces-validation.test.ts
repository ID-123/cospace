import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  spaceInputSchema,
  spaceUpdateSchema,
} from "@/features/spaces/validation";

describe("space input validation", () => {
  const validSpace = {
    name: "Sala de reuniones",
    description: "Sala privada para reuniones de equipo.",
    type: "meeting_room",
    capacity: 8,
    pricePerHour: 50000,
  };

  it("accepts a complete space with valid values", () => {
    assert.equal(spaceInputSchema.safeParse(validSpace).success, true);
  });

  it("rejects invalid capacity and prices that cannot fit a four-hour reservation", () => {
    assert.equal(
      spaceInputSchema.safeParse({ ...validSpace, capacity: 0 }).success,
      false,
    );
    assert.equal(
      spaceInputSchema.safeParse({ ...validSpace, pricePerHour: 536_870_912 })
        .success,
      false,
    );
  });

  it("allows partial edits but rejects empty changes", () => {
    assert.equal(
      spaceUpdateSchema.safeParse({ name: "Nueva sala" }).success,
      true,
    );
    assert.equal(spaceUpdateSchema.safeParse({}).success, false);
  });
});
