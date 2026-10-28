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

| Variable                   | Uso y valor                                                                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`             | Cadena de conexión PostgreSQL del proyecto. En Supabase se obtiene desde **Project Settings → Database → Connection string**; usa el formato URI y la opción adecuada para tu entorno. |
| `JWT_ACCESS_SECRET`        | Secreto de firma del access token; debe tener al menos 32 caracteres. Genera uno con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.                  |
| `JWT_REFRESH_SECRET`       | Secreto independiente para firmar los refresh tokens; debe tener al menos 32 caracteres. Genera otro valor aleatorio con el mismo comando.                                             |
| `ACCESS_TOKEN_EXPIRES_IN`  | Duración del access token, por ejemplo `15m`. También acepta segundos, horas o días: `s`, `m`, `h`, `d`.                                                                               |
| `REFRESH_TOKEN_EXPIRES_IN` | Duración del refresh token, por ejemplo `7d`.                                                                                                                                          |
| `ADMIN_EMAIL`              | Correo para la cuenta administradora creada por el seed.                                                                                                                               |
| `ADMIN_PASSWORD`           | Contraseña inicial del administrador: mínimo 8 caracteres y máximo 72 bytes UTF-8.                                                                                                     |
| `ADMIN_FIRST_NAME`         | Nombre del administrador (opcional; valor predeterminado: `Administrador`).                                                                                                            |
| `ADMIN_LAST_NAME`          | Apellido del administrador (opcional; valor predeterminado: `CoSpace`).                                                                                                                |
| `ADMIN_PHONE`              | Teléfono del administrador (opcional; valor predeterminado: `0000000000`).                                                                                                             |

El refresh token es un JWT firmado y de uso revocable: solo se guarda su hash
SHA-256 en la base de datos junto con su fecha de vencimiento. Los tokens se
transportan en cookies `httpOnly`, `sameSite=lax` y con `secure` habilitado en
producción; sus duraciones se controlan mediante las variables indicadas.

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

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000). El seed crea el
administrador y siete espacios de coworking listos para reservar. Es idempotente:
no duplica espacios por nombre ni reemplaza la contraseña de un administrador
existente; también actualiza los tres espacios de plantilla anteriores sin
cambiar sus identificadores ni perder sus reservas.

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
- El saludo de la barra de navegación abre el perfil, donde se pueden actualizar
  los datos personales y cambiar la contraseña.
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

| Comando              | Descripción                                          |
| -------------------- | ---------------------------------------------------- |
| `pnpm dev`           | Inicia Next.js en modo desarrollo.                   |
| `pnpm build`         | Genera el build de producción standalone.            |
| `pnpm start`         | Inicia el servidor de producción fuera de Docker.    |
| `pnpm lint`          | Ejecuta ESLint.                                      |
| `pnpm test`          | Ejecuta las pruebas ubicadas en la carpeta `tests/`. |
| `pnpm db:migrate`    | Aplica las migraciones pendientes.                   |
| `pnpm db:seed`       | Crea el administrador y los espacios de ejemplo.     |
| `pnpm db:seed:admin` | Alias histórico del seed completo.                   |

## Estructura principal

```text
src/
  app/                 Rutas, layouts y endpoints de la API
  features/            Código organizado por funcionalidad
    auth/              Sesiones, autenticación y formularios
    admin/             Administración de espacios
    dashboard/         Componentes del área privada
    home/              Contenido de la página principal
    reservations/      Reglas, formularios y lista de reservas
    spaces/            Validación y catálogo de espacios
  components/shared/   Componentes reutilizados entre funcionalidades
  database/            Entidades, consultas, migraciones, ORM y seeds
  proxy.ts             Protección y validación de sesión en peticiones
  mikro-orm.config.ts  Configuración del ORM
public/
  fonts/                Fuentes Mithella
  images/               Ilustraciones locales de los espacios
```

Las páginas y endpoints de `app/` conectan las rutas con cada funcionalidad;
las reglas y sus componentes viven juntos en `features/`. Los componentes
compartidos entre varias funcionalidades se mantienen en `components/shared/`.

## Despliegue

Actualmente desplegada utilizando Vercel y Supabase en [cospace-opal.vercel.app](https://cospace-opal.vercel.app)
