import { defineConfig } from 'vite';
import angular from 'vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  root: 'src', // This tells Vite to look in /src for index.html
  build: {
    outDir: '../dist', // Ensures build goes to the project root, not inside /src
  }
});
