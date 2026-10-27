# CoSpace

CoSpace es una aplicación fullstack para explorar y reservar escritorios, salas
de reuniones y cabinas de coworking. La aplicación usa Next.js 16, TypeScript,
MikroORM y PostgreSQL; la lógica de negocio y la persistencia se ejecutan en el
servidor.

## Requisitos previos

- Node.js 22 o superior.
- pnpm 12.15.0 (se puede activar con `corepack enable`).
- Una base de datos PostgreSQL. Para la prueba se recomienda crear un proyecto
  en Supabase y usar su cadena de conexión PostgreSQL.
- Docker, solo si se va a ejecutar la imagen de producción.

## Variables de entorno

Copia `.env.example` como `.env` y completa estas variables:

| Variable | Uso y valor |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL del proyecto. En Supabase se obtiene desde **Project Settings → Database → Connection string**; usa el formato URI y la opción adecuada para tu entorno. |
| `JWT_ACCESS_SECRET` | Secreto de firma del access token; debe tener al menos 32 caracteres. Genera uno con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. |
| `ADMIN_EMAIL` | Correo para la cuenta administradora creada por el seed. |
| `ADMIN_PASSWORD` | Contraseña inicial del administrador: mínimo 8 caracteres y máximo 72 bytes UTF-8. |
| `ADMIN_FIRST_NAME` | Nombre del administrador (opcional; valor predeterminado: `Administrador`). |
| `ADMIN_LAST_NAME` | Apellido del administrador (opcional; valor predeterminado: `CoSpace`). |
| `ADMIN_PHONE` | Teléfono del administrador (opcional; valor predeterminado: `0000000000`). |

El refresh token es un valor aleatorio opaco: solo se guarda su hash SHA-256 en
la base de datos. Por eso no se necesita un secreto JWT separado para el refresh
token. Los tokens se transportan en cookies `httpOnly`, `sameSite=lax` y con
`secure` habilitado en producción; el access token dura 15 minutos y el refresh
token 7 días.

## Ejecución en desarrollo

Desde una terminal:

```bash
git clone https://github.com/ID-123/cospace.git
cd cospace
corepack enable
pnpm install
cp .env.example .env
```

Completa `.env` con los valores anteriores y ejecuta, en este orden:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

La aplicación estará disponible en <http://localhost:3000>. El seed crea el
administrador y tres espacios de ejemplo. Es idempotente para esos registros:
no duplica espacios por nombre ni reemplaza la contraseña de un administrador
existente.

El correo y contraseña de administrador son los configurados en `ADMIN_EMAIL` y
`ADMIN_PASSWORD`; no hay credenciales predeterminadas en el repositorio.

## Reglas de negocio

- Solo se registran usuarios con rol `user`. El administrador se crea por seed.
- Una reserva dura entre 1 y 4 horas completas y debe estar entre las 07:00 y
  las 21:00, hora de Bogotá.
- No se reserva en el pasado ni con más de 30 días de anticipación.
- El servidor impide solapamientos confirmados para el mismo espacio y para el
  mismo usuario, y limita a 3 las reservas futuras confirmadas por usuario.
- No se reserva un espacio inactivo. El precio total se calcula en el servidor
  como horas por precio por hora; el cliente no envía el precio.
- El usuario solo ve sus reservas y puede cancelar las propias hasta 2 horas
  antes del inicio. Un administrador puede cancelar reservas.
- Cancelar cambia el estado a `cancelled`; no elimina el registro.
- Un espacio se desactiva, nunca se elimina. No se puede desactivar mientras
  tenga reservas futuras confirmadas.

Estas reglas se validan en los route handlers y en las transacciones de base de
datos, no solo en los formularios.

## Idiomas y renderizado

La interfaz ofrece español e inglés mediante el selector del navbar o de los
formularios de autenticación. La elección se conserva en una cookie de
preferencia no sensible. La home prerenderiza su contenido; el catálogo y el
detalle cargan datos de PostgreSQL en el servidor; el dashboard obtiene las
reservas en el cliente. La fecha y hora de las reservas se presentan en la zona
horaria de Bogotá.

## Ejecución con Docker

Primero configura `.env`, instala dependencias en el host y aplica las
migraciones y el seed como se indica arriba. Luego construye y ejecuta la imagen:

```bash
docker build -t cospace .
docker run --rm --env-file .env -p 3000:3000 cospace
```

La imagen ejecuta el build de producción en una etapa multi-stage y publica el
servidor standalone en el puerto `3000`. Las variables de `.env` se pasan al
contenedor en tiempo de ejecución; no se copian a la imagen.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Inicia Next.js en modo desarrollo. |
| `pnpm build` | Genera el build de producción standalone. |
| `pnpm start` | Inicia el servidor de producción fuera de Docker. |
| `pnpm lint` | Ejecuta ESLint. |
| `pnpm test` | Ejecuta las pruebas de reglas de reservas y validación de espacios. |
| `pnpm db:migrate` | Aplica las migraciones pendientes. |
| `pnpm db:seed` | Crea el administrador y los espacios de ejemplo. |
| `pnpm db:seed:admin` | Alias histórico del seed completo. |

## Estructura principal

```text
src/
  app/                 Páginas App Router, route groups y route handlers
  auth/                Sesiones, validaciones y reglas de reservas
  components/          Formularios, navegación, catálogo y administración
  database/             Entidades, consultas, migraciones y seed
public/
  fonts/                Fuentes Mithella
  images/               Ilustraciones locales de los espacios
```

## Despliegue

La aplicación está preparada para ejecutarse como servidor Node.js standalone y
requiere una base de datos PostgreSQL accesible desde el entorno de ejecución.
Todavía no hay una URL pública de despliegue configurada.
