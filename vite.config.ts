import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
// import devtools from 'solid-devtools/vite';

export default defineConfig({
    resolve: {
        alias: {
            "@": "/src",
        },
    },
    plugins: [
        // devtools(),
        solidPlugin(),
    ],
    server: {
        port: 3000,
    },
    build: {
        target: "esnext",
    },
});
