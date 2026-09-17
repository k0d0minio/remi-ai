import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { cn } from "../lib/utils";

type Props = {
  /** The markdown source. Rendered as prose — never as a document. */
  children: string;
  className?: string;
};

/**
 * Markdown as prose, for content a person wrote and a person reads.
 *
 * It lives here rather than in the app that needed it first because a nutrition
 * rule written in the console is the same text a patient will later read in the
 * product — one renderer, two apps, per `CONVENTIONS.md` § "Keeping the
 * codebase lean".
 *
 * **Why the pipeline is assembled here instead of using `react-markdown`.**
 * That package exports `MarkdownHooks` beside the synchronous component, and
 * the module imports `useEffect`/`useState` at the top level to build it. The
 * `react-server` build of React exports neither, so the module cannot link in a
 * server component's graph at all — the import is enough, calling it is not
 * required. It took down exactly one app: the only one that rendered markdown.
 * Bundling does not help either, because the unused import survives
 * tree-shaking. So the four remark/hast packages `react-markdown` wraps are
 * used directly, none of which imports React outside `react/jsx-runtime`, and
 * this stays a true server component with nothing to hydrate.
 *
 * **Raw HTML stays off**, and here it is structural rather than a flag: without
 * `allowDangerousHtml`, `remark-rehype` drops raw HTML nodes on the way to
 * hast, so an `<img onerror>` typed into the form is discarded before anything
 * can render it. Turning it on would mean adding `rehype-raw` and a sanitiser,
 * which is a decision with a threat model attached — this text is destined for
 * a patient's screen.
 *
 * The element classes are spelled out rather than taken from a typography
 * plugin: the repo has one type scale, in `tokens.css`, and a plugin would be a
 * second one that drifts from it.
 */

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);

export const Markdown = ({ children, className }: Props) => {
  const tree = processor.runSync(processor.parse(children));

  return (
    <div
      className={cn(
        "text-foreground flex flex-col gap-3 text-sm leading-relaxed",
        "[&_h1]:text-lg [&_h1]:font-semibold",
        "[&_h2]:text-base [&_h2]:font-semibold",
        "[&_h3]:text-sm [&_h3]:font-medium",
        "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-5",
        "[&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-1 [&_ol]:pl-5",
        "[&_a]:underline [&_a]:underline-offset-2",
        "[&_code]:bg-muted [&_code]:rounded-sm [&_code]:px-1 [&_code]:py-0.5",
        "[&_blockquote]:border-border [&_blockquote]:text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:pl-3",
        "[&_table]:w-full [&_table]:text-left",
        "[&_th]:text-muted-foreground [&_th]:font-medium",
        "[&_td]:border-border [&_td]:border-t [&_td]:py-1",
        "[&_hr]:border-border",
        className,
      )}
    >
      {toJsxRuntime(tree, { Fragment, jsx, jsxs })}
    </div>
  );
};
