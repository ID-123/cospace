import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    'La contraseña no puede superar los 72 bytes.',
  );

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, 'El correo electrónico es demasiado largo.')
    .pipe(z.email('Ingresa un correo electrónico válido.')),
  password: passwordSchema,
});

export const registrationSchema = credentialsSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });
