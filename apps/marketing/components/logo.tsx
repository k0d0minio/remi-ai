import Image from "next/image";

type Props = {
  /** Rendered height in pixels. The width follows the image's ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
};

const RATIO = 560 / 193;

/**
 * Morgane's logo, the image under `public/brand/` (a copy of
 * `packages/ui/brand/logo/remi-logo.png`). The name is never typed as a
 * logo on this site. `alt` is empty: the parent link or heading names it.
 */
export const Logo = ({ height = 30, className, priority }: Props) => (
  <Image
    src="/brand/remi-logo.png"
    alt=""
    width={Math.round(height * RATIO)}
    height={height}
    priority={priority}
    className={className}
    style={{ height, width: "auto" }}
  />
);
