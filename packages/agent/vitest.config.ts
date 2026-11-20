import { defineConfig } from "vitest/config";

// A `.md` import is the file's text, as tsup's `text` loader makes it in the
// build (`src/markdown.d.ts`).
export default defineConfig({
  plugins: [
    {
      name: "markdown-as-text",
      enforce: "pre",
      transform: (code, id) =>
        id.endsWith(".md")
          ? { code: `export default ${JSON.stringify(code)};`, map: null }
          : null,
    },
  ],
});
