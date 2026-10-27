import { z } from 'zod';

const maximumHourlyPrice = Math.floor(2_147_483_647 / 4);

export const spaceInputSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(255, 'La descripción no puede superar 255 caracteres.'),
  type: z.enum(['desk', 'meeting_room', 'booth']),
  capacity: z.number().int().min(1).max(500),
  pricePerHour: z.number().int().min(1).max(maximumHourlyPrice),
});

export const spaceUpdateSchema = spaceInputSchema
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes indicar al menos un dato para actualizar.',
  });

export type SpaceInput = z.infer<typeof spaceInputSchema>;
