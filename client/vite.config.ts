import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
    plugins: [reactRouter(), tsconfigPaths()],
    server: {
        host: '0.0.0.0',
        port: 5173,
    }
})
