import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // No usamos una carpeta "public": las imágenes estáticas (skins, helmets,
  // el logo de la carta 3D...) van dentro de /img en la raíz del proyecto
  // (al mismo nivel que /src), y se referencian con ruta absoluta desde "/",
  // ej: img/logo.png → src="/logo.png"
  publicDir: 'img',
  server: {
    port: 5173,
    open: true
  }
});
