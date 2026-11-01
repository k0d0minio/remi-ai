/**
 * A `.md` import is the file's text. tsup inlines it with esbuild's `text`
 * loader, and vitest with the plugin in `vitest.config.ts`. The consent texts
 * are the only `.md` imports.
 */
declare module "*.md" {
  const text: string;
  export default text;
}
