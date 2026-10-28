import { randomUUID } from "node:crypto";
import { defineEntity, p } from "@mikro-orm/core";

export const SpaceSchema = defineEntity({
  name: "Space",
  tableName: "space",
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => randomUUID()),
    name: p.string(),
    description: p.string(),
    type: p.enum(["desk", "meeting_room", "booth"]),
    capacity: p.integer(),
    pricePerHour: p.integer(),
    isActive: p.boolean().default(true),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Space extends SpaceSchema.class {}

SpaceSchema.setClass(Space);
