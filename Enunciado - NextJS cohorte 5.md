# **Prueba de desempeño**

## **Desarrollo de una aplicación fullstack con Next.js 16**

## **Propósito**

El propósito de esta prueba técnica es evaluar la capacidad del coder para aplicar sus conocimientos en Next.js a través del desarrollo de una aplicación web fullstack funcional y bien organizada. La prueba está diseñada para verificar el dominio de conceptos clave como el uso de un ORM y una base de datos relacional, la creación de route handlers, el uso de rutas dinámicas y agrupación de rutas, el manejo de layouts, las estrategias de renderizado (SSG, SSR y CSR), la autenticación con access token y refresh token almacenados de forma segura en cookies, la protección de rutas, la internacionalización, la contenerización con Docker y el despliegue. Además, se busca evidenciar su capacidad para implementar buenas prácticas de desarrollo, como el código limpio, el uso de componentes compartidos, la correcta implementación de reglas de negocio y la documentación clara del proyecto.

## **Metodología**

**Tiempo y duración:** la prueba técnica tiene una duración estimada de 7 horas. Esta metodología ágil permite simular un entorno de trabajo realista, donde los coders reciben tareas con plazos definidos y deben gestionar su tiempo y recursos de manera eficiente.

## **Rúbricas de evaluación**

Dirígete a Moodle para consultar las rúbricas de la prueba.

## **Reglas**

- Evita el plagio. Si se comprueba que el código que haces es exactamente al de un compañero, se toma como 0 en la nota de la prueba.

- Por cada variable o función no tipada tendrás un 1.5% menos.

- Tienes 7 horas máximo para la culminación de la prueba (6:00 am a 1:00 pm) con 3 descansos (7:40 am a 8:00 am, 09:40 am a 10:00 am y 11:40m a 12:00 pm).

- Puedes usar documentación oficial, ejemplos de código abierto y herramientas de IA como apoyo, evitando el plagio.

- Debes tener la capacidad de explicar tu código.

- Debes realizar la prueba de forma individual.

## **Sustentación técnica**

La sustentación se realiza en vivo. Debes ser capaz de explicar tu código y las decisiones que tomaste.

## **Descripción del proyecto**

El objetivo es desarrollar **CoSpace** , una plataforma de reservas de espacios de coworking (escritorios, salas de reuniones y cabinas) donde los usuarios pueden registrarse, iniciar sesión, explorar los espacios disponibles y reservarlos por horas. Los administradores gestionan el catálogo de espacios.

La aplicación debe ser **fullstack** : no se permite consumir una API externa para obtener los datos. Toda la información debe vivir en una base de datos propia y exponerse mediante route handlers de Next.js.

## **Requisitos de negocio**

### **1. Roles**

- **Usuario:** puede registrarse, iniciar sesión, ver el catálogo de espacios, reservar y cancelar sus propias reservas.

- **Administrador:** además de lo anterior, puede crear, editar y desactivar espacios. Este rol se crea mediante seed, no desde el registro público.

### **2. Funcionalidades**

- Registro e inicio de sesión de usuarios.

- Catálogo público de espacios y vista de detalle de cada espacio.

- Reserva de un espacio por parte de un usuario autenticado.

- Visualización y cancelación de las reservas propias.

- Gestión de espacios por parte del administrador.

### **3. Reglas de negocio**

#### **Reservas**

1. Una reserva dura entre 1 y 4 horas, en horas completas (de 10:00 a 12:00, no de 10:30 a 11:45).

2. Solo se puede reservar entre las 7:00 y las 21:00.

3. No se puede reservar en el pasado ni con más de 30 días de anticipación.

4. Un espacio no puede tener dos reservas confirmadas que se solapen. Si una reserva termina a las 12:00, otra puede iniciar a las 12:00.

5. Un usuario no puede tener dos reservas confirmadas que se solapen en el tiempo, aunque sean en espacios distintos.

6. Un usuario puede tener máximo 3 reservas futuras confirmadas.

7. No se puede reservar un espacio desactivado.

8. El precio total de la reserva lo calcula el servidor (horas × precio por hora). Nunca se acepta del cliente.

#### **Cancelación:**

9. Solo el dueño de la reserva o un administrador puede cancelarla.

10. Un usuario puede cancelar su reserva hasta 2 horas antes de su inicio.

11. Cancelar una reserva cambia su estado a cancelada. El registro no se elimina.

#### **Espacios**

12. Un espacio no se elimina, se desactiva. Los espacios desactivados no aparecen en el catálogo público.

13. No se puede desactivar un espacio que tenga reservas futuras confirmadas.

#### **Seguridad**

14. Un usuario no puede ver ni modificar reservas de otro usuario, incluso si cambia el id en la URL.

## **Requerimientos técnicos**

### **1. Estructura del proyecto**

Configura un proyecto Next.js 16 con App Router y TypeScript, asegurando una estructura bien organizada de carpetas, componentes y layouts reutilizables. El código debe ser limpio, ordenado y entendible. No se exige una arquitectura específica.

### **2. Rutas y route groups**

- Organiza las rutas utilizando **route groups** : `(public)` , `(auth)` , `(private)` y `(admin)` , de forma que no afecten la URL.

- Implementa rutas dinámicas con `[id]` para visualizar el detalle de cada espacio.

- Páginas mínimas: Home, Catálogo de espacios, Detalle del espacio, Registro, Login, Dashboard (mis reservas) y Panel de administración.

### **3. Layouts y componentes**

- Implementa un **root layout** con la estructura base de la aplicación.

- • Crea un **layout para cada route group** con un diseño propio:

`o (public)` : navbar y footer.

`o (auth)` : diseño centrado y simple. `o (private)` : navbar con menú de usuario.

`o (admin)` : layout propio del panel.

- Crea componentes compartidos y reutilizables (navbar, footer, botones, formularios, tarjetas, etc.), con una organización clara de carpetas. Los estilos son libres.

### **4. Estrategias de renderizado**

Aplica la estrategia de renderizado adecuada en cada página:

- **SSG:** Home.

- **SSR:** catálogo y detalle del espacio.

- **CSR:** dashboard de reservas del usuario.

### **5. Route handlers**

Crea route handlers con Next.js para:

- Autenticación: registro, login, refresh y logout.

- Espacios: listar, crear, editar y desactivar.

- Reservas: listar las propias, crear y cancelar.

Todos deben validar la entrada y responder con un formato de error consistente y códigos HTTP correctos (400, 401, 403, 404, 409).

### **6. Base de datos y ORM**

- Diseña un modelo relacional coherente con los requisitos de negocio.

- Utiliza un ORM a elección. Por ejemplo: Prisma, TypeORM, MikroORM o Drizzle.

- Implementa migraciones y un seed que cree el administrador y espacios de ejemplo.

- Base de datos PostgreSQL alojada en **Supabase** .

- Las reglas de negocio deben garantizarse en el backend, no solo en la interfaz.

### **7. Autenticación y autorización**

- Registro e inicio de sesión con contraseñas almacenadas de forma segura (hasheadas).

- Implementa **access token** y **refresh token** , ambos enviados en cookies `httpOnly` , `secure` y `sameSite` . No se permite guardarlos en `localStorage` ni devolverlos en el body.

- El refresh token debe almacenarse hasheado en la base de datos, y el logout debe revocarlo.

- Implementa el flujo de renovación del access token sin que el usuario deba volver a iniciar sesión.

- Los route handlers validan la sesión y el rol por su cuenta, sin depender únicamente del proxy.

### **8. Protección de rutas con proxy**

Utiliza `proxy.ts` para proteger las rutas privadas y de administrador, redirigiendo al login a quien no tenga sesión y bloqueando a los usuarios sin rol de administrador en las rutas de admin.

### **9. Internacionalización (i18n)**

Implementa soporte multilingüe para que la interfaz esté disponible en español e inglés, con un selector de idioma visible. La solución de i18n es libre.

### **10. Hidratación**

Incluye al menos un componente que dependa de datos del cliente (por ejemplo, fecha u hora local) sin generar errores de hidratación.

### **11. Optimización**

Utiliza `next/image` para las imágenes de los espacios.

### **12. Docker**

Incluye un **Dockerfile** que construya y ejecute la aplicación correctamente. El `dockercompose` es opcional.

### **13. Variables de entorno**

Incluye un archivo **`.env.example`** con todas las variables que necesita el proyecto, sin valores reales ni secretos. Ejemplo:

env

```
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

### **14. README**

El README es un entregable evaluado. Debe permitir que cualquier persona, **partiendo de cero y siguiendo solo ese documento** , ejecute el proyecto completo. Debe incluir:

1. **Descripción breve** del proyecto.

2. **Requisitos previos:** qué debe tener instalado o creado la persona (versión de Node.js, gestor de paquetes, Docker, cuenta de Supabase, etc.).

3. **Variables de entorno:** una explicación de cada variable del `.env.example` : para qué sirve, qué valor lleva y cómo obtenerlo (por ejemplo, de dónde se saca la cadena de conexión en Supabase y cómo generar los secretos de los tokens).

4. **Ejecución en desarrollo** , con los comandos exactos y en orden:
   - a. Clonar el repositorio e instalar dependencias.

   - b. Crear el `.env` a partir del `.env.example` y completarlo.

   - c. Ejecutar las migraciones.

   - d. Ejecutar el seed.

   - e. Levantar el proyecto en modo desarrollo.

5. **Credenciales del administrador** creado por el seed.

6. **Ejecución con Docker:** comandos para construir la imagen y correr el contenedor, indicando cómo pasarle las variables de entorno.

7. **Scripts disponibles** en el `package.json` y qué hace cada uno.

8. **Estructura de carpetas** del proyecto, explicada brevemente.

**9. URL de la aplicación desplegada.**

Si no es posible ejecutar el proyecto siguiendo el README, se penaliza.

### **15. Despliegue**

Despliega la base de datos en **Supabase** y la aplicación en **Vercel** , asegurando que todas las funcionalidades (route handlers, rutas dinámicas, autenticación) funcionen correctamente.

### **16. Calidad del código**

- TypeScript sin `any` .

- Nombres claros, funciones con una sola responsabilidad y código sin duplicación.

## **Puntos extra**

Rate limiting en el login, idempotencia al crear reservas, `docker-compose` , pipeline de CI y pruebas de al menos una regla de negocio.

## **Entregables:**

### **Código del Proyecto:**

- Subir el proyecto a un repositorio en GitHub(Asegúrate que el repo este publico).

- Cargar a Moodle un archivo TXT con el enlace al repositorio y un .ZIP de los mismo.

- Solo se revisarán commits que cumplan con la fecha límite de la prueba.

### **Instrucciones:**

- Incluir un archivo README con instrucciones claras sobre cómo instalar, configurar y ejecutar la aplicación (No pretendas que el TL tenga que

- hacer ingeniera inversa para lograr levantar tu aplicativo, asegúrate de incluir apikeys, variables de entorno para levantar, o cualquier recurso para levantar el proyecto).

## **Política Buen uso de la IA e Internet**

### **Buen Uso de la IA**

- **Asistencia en Código:** La IA se podrá utilizar para obtener sugerencias y

- correcciones en el código, pero no para resolver tareas completas de manera autónoma.

- **Aprendizaje y Recursos:** Los coders podrán utilizar herramientas de IA para acceder a materiales de aprendizaje y documentación relevante.

- **Optimización y Mejora:** Se permite el uso de la IA para optimizar y mejorar el código ya desarrollado por el coder, siempre y cuando se mantenga la integridad del proceso de aprendizaje.

### **Alcance de la IA**

- **Código y Desarrollo:** La IA puede asistir en la escritura, depuración y optimización del código.

- **Investigación:** Los coders podrán utilizar la IA para buscar información y resolver dudas técnicas, puntuales y acotadas.

- **Documentación:** La IA puede ayudar a generar documentación y comentarios en el código.

### **Límites de la IA**

- **Prohibido el Plagio:** No se permite la generación de soluciones completas o la copia de código de fuentes externas sin la debida atribución.

- **Autonomía del Coder:** La IA no debe sustituir la capacidad del coder para resolver problemas; debe actuar como una herramienta de apoyo.

- **Evaluación de Habilidades:** La IA no puede ser utilizada para responder a preguntas de evaluación de manera directa, ya que el objetivo es evaluar las competencias del coder.

### **Buen Uso de Internet**

- **Investigación y Recursos:** Se permite el uso de internet para buscar información, acceder a documentación y utilizar recursos educativos.

- **Comunicación:** Los coders pueden utilizar internet para comunicarse con el equipo de evaluación o pedir asistencia técnica si es necesario.

- **Desarrollo Colaborativo:** El uso de plataformas de desarrollo colaborativo en línea (como GitHub) está permitido para la gestión de proyectos.

### **Alcance de Internet**

- **Acceso a Documentación:** Los coders podrán consultar documentación oficial y recursos educativos en línea.

- **Resolución de Problemas:** Se permite el uso de foros y comunidades técnicas para la resolución de dudas específicas y acotadas siempre que se referencie.

- **Actualizaciones y Herramientas:** Los coders pueden descargar e instalar herramientas y actualizaciones necesarias para el desarrollo del assessment.

### **Límites de Internet**

- **Fuentes Confiables:** Se debe verificar la fiabilidad de las fuentes utilizadas. No se permite el uso de contenido no autorizado o pirata.

- **Prohibido el Fraude:** No se permite buscar o utilizar soluciones completas o respuestas directas a los problemas planteados en el assessment.

- **Seguridad y Privacidad:** Se debe garantizar la seguridad y privacidad de la información personal y de los datos del assessment. No se permite compartir información confidencial.

### **Monitoreo y Cumplimiento**

- **Supervisión:** El uso de IA e internet será monitoreado por el TL para asegurar el cumplimiento de los lineamientos.

- **Consecuencias:** Cualquier violación a estos lineamientos resultará en una evaluación adicional y posibles sanciones, incluyendo la descalificación del assessment.

### **Ética y Responsabilidad**

- **Uso Ético:** Se espera que todos los coders usen la IA e internet de manera ética y responsable.

- **Responsabilidad Individual:** Cada coder es responsable de su propio trabajo y del cumplimiento de estos lineamientos.
