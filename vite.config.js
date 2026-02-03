import { defineConfig } from 'vite';

export default defineConfig({
    base: '/smac-viz/', // Use relative paths for GitHub Pages
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    }
});
