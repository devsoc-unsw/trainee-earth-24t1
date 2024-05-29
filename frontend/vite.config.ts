import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@frontend": path.resolve(__dirname, "./"),
      "@backend/types": path.resolve(__dirname, "../backend/types"),
      "@backend/utils": path.resolve(__dirname, "../backend/utils"),
      "@backend/sample-data": path.resolve(__dirname, "../backend/sample-data"),
    },
  },
});
