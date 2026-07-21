import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Los archivos grandes (PDFs de catálogo, fotos en alta calidad) ya no
      // pasan por el body de la Server Action: se suben directo del
      // navegador a Supabase Storage vía signed upload URL (ver
      // lib/upload-client.ts). Esto evita el límite de tamaño de request
      // que imponen los hostings serverless (p. ej. Vercel, ~4.5 MB) y que
      // no se puede subir vía configuración de Next. Las Server Actions
      // solo transportan ya campos de texto.
      bodySizeLimit: "5mb",
    },
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
