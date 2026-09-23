import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],

  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReactNodes",
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "es") {
          return "react-nodes.js";
        }

        return "react-nodes.cjs";
      },
    },

    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});