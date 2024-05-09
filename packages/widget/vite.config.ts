import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env": process.env,
  },
  plugins: [react(), svgr()],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "widget",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        format: "es",
        globals: {
          react: "React",
          "react-dom": "React-dom",
        },
      },
    },
  },
});
