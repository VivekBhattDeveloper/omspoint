import { defineConfig } from "vite";
import { gadget } from "gadget-server/vite";
import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import type { RollupWarning } from "rollup";

export default defineConfig({
  plugins: [gadget(), reactRouter()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./web"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      onwarn(warning: RollupWarning, defaultWarn) {
        if (warning.message?.includes("Can't resolve original location of error")) {
          return;
        }
        defaultWarn(warning);
      },
    },
  },
  logLevel: "error", // TODO: restore to the default once upstream shadcn/radix packages publish sourcemaps.
});
