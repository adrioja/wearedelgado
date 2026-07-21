# We Are Delgado — Landing

Landing page en Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 +
Framer Motion, inspirada en el lenguaje visual de dica.es (vídeo hero,
storytelling por scroll, parallax suave, CTAs tipo link con flecha).

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Assets pendientes de sustituir

El proyecto no incluye vídeo ni fotografía real (no se han reutilizado los
assets de dica.es por no ser propiedad de este proyecto). Sustituye:

- `public/video/hero.mp4` y `public/video/hero-poster.jpg` — vídeo de fondo del
  hero. Si el archivo no existe, la sección degrada automáticamente a un
  fondo en gradiente (ver `components/hero.tsx`).
- Los bloques `ParallaxImage` (placeholders con gradiente) en
  `components/about-section.tsx` y `components/projects-section.tsx` — sustituir
  por `next/image` con fotografía real de estudio/proyectos.

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena con los datos de tu proyecto de
Supabase (Project Settings → API):

```bash
cp .env.example .env.local
```

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

Las dos primeras (`SUPABASE_URL` / `SUPABASE_ANON_KEY`) solo se usan en el
servidor. Las dos `NEXT_PUBLIC_*` son las mismas credenciales pero expuestas
al navegador a propósito: el backoffice sube los PDFs de catálogo y las fotos
de proyecto **directamente desde el navegador** a Supabase Storage (vía
signed upload URL, ver `lib/upload-client.ts`), sin pasar por una Server
Action — necesario porque los hostings serverless (Vercel incluido) limitan
el body de una Server Action a unos pocos MB, muy por debajo de lo que pesa
un catálogo en PDF. La `anon key` no es secreta (el control de acceso real
lo hacen las RLS policies de `supabase/schema.sql`), así que exponerla es
seguro y es el patrón estándar de Supabase para subidas desde el cliente.

Importante: las variables `NEXT_PUBLIC_*` se incrustan en el bundle en
**tiempo de build**, no en runtime. Si las añades o cambias en Vercel,
necesitas volver a desplegar (`vercel deploy --prod` o un redeploy desde el
dashboard) para que tengan efecto.

## Base de datos (Supabase)

El formulario de contacto (`#contacto`) guarda leads en una tabla `leads`, y
el backoffice (`/admin`) gestiona proyectos, redes sociales y ajustes del
sitio (contacto, horario, ubicación).

Los cambios de esquema también están disponibles como migraciones individuales en
`supabase/migrations/` (formato compatible con `supabase db push` de la CLI), por
si prefieres aplicarlos uno a uno en vez de ejecutar `schema.sql` entero.

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre el SQL Editor y ejecuta `supabase/schema.sql` completo. Esto crea:
   - `leads` (con RLS: `anon` solo puede insertar; `authenticated` puede leer).
   - `projects`, `social_links`, `site_settings` (contenido editable desde el
     backoffice; lectura pública, escritura solo para `authenticated`).
   - El bucket de Storage `project-images` (público en lectura, con límite de
     20 MB y solo JPG/PNG/WEBP), con sus policies de acceso.
   - El bucket de Storage `catalogs` (público en lectura, con límite de 50 MB,
     PDF + portada JPG/PNG/WEBP), con sus policies de acceso.
3. Copia la URL del proyecto y la `anon public key` a tu `.env.local`.
4. Crea el usuario admin manualmente en **Authentication → Users → Add user**
   (email + contraseña). No hay pantalla de registro público — solo esa
   cuenta podrá entrar en `/admin`.
5. Entra en `/admin/login` con esas credenciales para gestionar proyectos,
   ajustes de contacto/horario/ubicación y redes sociales, y ver los mensajes
   del formulario de contacto.

## Despliegue en Vercel

Este repo está listo para desplegar, sin necesidad de configuración extra de
`vercel.json` (Next.js se detecta automáticamente).

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. En **Environment Variables**, añade las cuatro variables de la sección
   anterior (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` — los mismos valores que en `.env.local`).
3. Deploy. Framework preset: Next.js (detectado automáticamente).

O desde la CLI:

```bash
npm i -g vercel
vercel link
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel deploy --prod
```

## Accesibilidad y rendimiento

- Toda la animación respeta `prefers-reduced-motion` (transiciones globales
  desactivadas + parallax/autoplay de vídeo desactivados en
  `components/hero.tsx`, `components/parallax-image.tsx`, `components/reveal.tsx`).
- Contraste de texto verificado a AA sobre los tokens de `app/globals.css`.
- El formulario de contacto valida en servidor (`app/actions.ts`) y no confía
  en la validación del cliente.
