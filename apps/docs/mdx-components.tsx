import { useMDXComponents as themeComponents } from "nextra-theme-docs";
import type { MDXComponents } from "nextra/mdx-components";

export const useMDXComponents = (components?: MDXComponents): MDXComponents => ({
  ...themeComponents(),
  ...components,
});
