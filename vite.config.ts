import build from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
import { defineConfig, UserConfig } from "vite";

const config = {
  plugins: [
    devServer({
      adapter,
      entry: "src/index.tsx",
    }),
  ],
  ssr: {
    target: "webworker",
    external: ["@prisma/client"],
  },
} satisfies UserConfig;

export default defineConfig(({ mode }) => {
  if (mode === "development") {
    return {
      ...config,
      plugins: [...config.plugins],
      ssr: {
        ...config.ssr,
        external: [...config.ssr.external],
      },
    };
  }
  return {
    ...config,
    plugins: [build(), ...config.plugins],
    ssr: {
      ...config.ssr,
      external: [...config.ssr.external],
    },
  };
});
