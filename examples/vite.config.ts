import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

import mdx from '@mdx-js/rollup';

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@basestacks/data-grid': path.resolve(__dirname, '../src'),
        },
    },
    plugins: [
        mdx({}),
        react(),
        tailwindcss(),
        TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    ],
});
