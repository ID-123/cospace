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
    firstName: z
      .string()
      .trim()
      .min(2, 'Ingresa tus nombres.')
      .max(80, 'El nombre no puede superar 80 caracteres.'),
    lastName: z
      .string()
      .trim()
      .min(2, 'Ingresa tus apellidos.')
      .max(80, 'El apellido no puede superar 80 caracteres.'),
    phone: z
      .string()
      .trim()
      .min(7, 'El teléfono debe tener al menos 7 caracteres.')
      .max(20, 'El teléfono no puede superar 20 caracteres.')
      .regex(/^\+?[0-9][0-9\s()-]*$/, 'Ingresa un número de teléfono válido.')
      .refine(
        (phone) => phone.replace(/\D/g, '').length >= 7,
        'El teléfono debe incluir al menos 7 dígitos.',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });
