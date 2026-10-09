import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' → site, repo adı ne olursa olsun (kullanici.github.io/repo-adi/) doğru çalışır
export default defineConfig({
  plugins: [react()],
  base: './',
});
