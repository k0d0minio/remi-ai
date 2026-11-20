/**
 * A `.md` import is the file's text. tsup inlines it with esbuild's `text`
 * loader, and vitest with the plugin in `vitest.config.ts`. The identity file,
 * the contracts and the prompts are the `.md` imports.
 */
declare module "*.md" {
  const text: string;
  export default text;
}
