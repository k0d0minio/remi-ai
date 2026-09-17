import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
 * codebase lean". It is server-safe: markup and classes, no hook, no handler.
 *
 * **Raw HTML stays off.** `react-markdown` ignores embedded HTML unless
 * `rehype-raw` is added, and it is deliberately not added: this renders text
 * typed into a form, and the day that text reaches a patient's screen it must
 * not be able to carry a `<script>` or an iframe with it. Turning it on is a
 * decision with a threat model attached, not a convenience.
 *
 * The element classes are spelled out rather than taken from a typography
 * plugin: the repo has one type scale, in `tokens.css`, and a plugin would be a
 * second one that drifts from it.
 */
export const Markdown = ({ children, className }: Props) => (
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
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
  </div>
);
