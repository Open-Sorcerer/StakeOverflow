import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("./src", import.meta.url));

// Keep the absolute imports CRA allowed via jsconfig `baseUrl: "src"`
// (e.g. `components/Nav`, `helpers/content`, `config`).
const alias = Object.fromEntries(
  readdirSync(src, { withFileTypes: true }).map((entry) => {
    const name = entry.isDirectory() ? entry.name : entry.name.replace(/\.[^.]+$/, "");
    return [name, `${src}/${entry.name}`];
  })
);

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  server: { port: 3000 },
});
