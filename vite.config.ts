
import { defineConfig } from 'vite';

export default defineConfig({
  // تنظیم مسیر پایه به صورت نسبی تا در زیرشاخه‌های گیت‌هاب به درستی کار کند
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  }
});
