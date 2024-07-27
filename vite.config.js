import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
plugins: [react(), visualizer()],
build: {
    rollupOptions: {
    output: {
        manualChunks(id) {
        if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
        }
        },
    },
    },
    chunkSizeWarningLimit: 1000, // Ajusta este valor según sea necesario
},
});
