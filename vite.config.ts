import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
  // Define the base path for the application
  build: {
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    emptyOutDir: true
  },
});
