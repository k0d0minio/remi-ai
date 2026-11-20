import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// A `.md` import is the file's text, as tsup's `text` loader makes it in the
// build. The consent texts are the `.md` imports of this package
// (`src/markdown.d.ts`), and `@remi/agent` has its contracts and its prompts.
//
// The tests read `@remi/agent` from its source, so they need no build of it.
export default defineConfig({
  resolve: {
    alias: {
      "@remi/agent": fileURLToPath(
        new URL("../agent/src/index.ts", import.meta.url),
      ),
    },
  },
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
