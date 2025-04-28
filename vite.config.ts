import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    base: "/ai-simple-chat-app/",
  server: {
    allowedHosts: ["pure-clever-moray.ngrok-free.app"],
  },
});
