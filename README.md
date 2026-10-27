
# CoSpace

Aplicación fullstack para explorar y reservar espacios de coworking.

## Preparar la base de datos y el administrador

1. Usa Node.js y pnpm en las versiones indicadas por `package.json`.
2. Crea una base de datos PostgreSQL en Supabase y copia su cadena de conexión en `DATABASE_URL`.
3. Copia `.env.example` a `.env` y completa:
   - `DATABASE_URL`: cadena de conexión PostgreSQL de Supabase.
   - `ADMIN_EMAIL`: correo con el que se creará el administrador.
   - `ADMIN_PASSWORD`: contraseña del administrador (mínimo 8 caracteres; máximo 72 bytes).
   - `JWT_ACCESS_SECRET`: secreto aleatorio de al menos 32 caracteres para firmar tokens de acceso. Genéralo con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` y copia el resultado a `.env`.
4. Instala dependencias con `pnpm install`.
5. Aplica las migraciones con `pnpm db:migrate`.
6. Crea el administrador con `pnpm db:seed:admin`.
7. Inicia el proyecto con `pnpm dev`.

El seed es idempotente: conserva una cuenta administradora ya existente sin cambiar su contraseña. Si el correo ya pertenece a un usuario normal, el seed se detiene y no eleva sus permisos.

## API de autenticación

- `POST /api/auth/register`: crea una cuenta de usuario y la deja autenticada.
- `POST /api/auth/login`: inicia sesión con correo y contraseña.
- `POST /api/auth/refresh`: renueva la sesión usando la cookie de refresh.
- `POST /api/auth/logout`: revoca el refresh token y cierra la sesión.

Los tokens se envían únicamente en cookies `httpOnly`; en producción también se marcan `secure`. El access token dura 15 minutos y el refresh token 7 días.
