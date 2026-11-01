import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { IconName } from "./names";

export { ICON_NAMES } from "./names";
export type { IconName } from "./names";

/*
 * Icon — the project's ONLY icon source.
 *
 * Renders an icon from the supplied library (Icon_bs/Icon → public/icons, see
 * scripts/build-icons.mjs). Every Figma slice must use this component, never lucide-react,
 * an inline <svg>, an emoji or a hand-drawn glyph. If Figma needs an icon the library does not
 * have, stop and ask — do not substitute a "close enough" one.
 *
 *   <Icon name="arrow-left" />                 16px, takes the text colour
 *   <Icon name="trash-2" size={20} className="text-danger" />
 *
 * Finding a name:  node scripts/find-icon.mjs arrow
 *
 * Each icon is fetched once from /icons/<name>.svg and cached; the box is reserved at `size`
 * so nothing shifts while it loads. The files are our own static assets, drawn with
 * `currentColor`, so colour comes from CSS (`text-*`), not from a prop.
 */

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

function load(name: string): Promise<string> {
  const hit = cache.get(name);
  if (hit !== undefined) return Promise.resolve(hit);
  let p = inflight.get(name);
  if (!p) {
    p = fetch(`/icons/${name}.svg`)
      .then((r) => (r.ok ? r.text() : ""))
      .catch(() => "")
      .then((svg) => {
        // let the <svg> fill the box we size, whatever its own width/height say
        const fitted = svg.replace(/<svg([^>]*?)\swidth="[^"]*"/, "<svg$1").replace(/<svg([^>]*?)\sheight="[^"]*"/, "<svg$1");
        if (fitted) cache.set(name, fitted);
        inflight.delete(name);
        return fitted;
      });
    inflight.set(name, p);
  }
  return p;
}

export interface IconProps {
  name: IconName;
  /** Pixel size of the square box. Default 16. */
  size?: number;
  className?: string;
  /** Accessible label. Leave out for decorative icons (they are hidden from screen readers). */
  title?: string;
}

export function Icon({ name, size = 16, className, title }: IconProps) {
  const [svg, setSvg] = useState<string>(cache.get(name) ?? "");

  useEffect(() => {
    let alive = true;
    const hit = cache.get(name);
    if (hit !== undefined) setSvg(hit);
    else load(name).then((s) => { if (alive) setSvg(s); });
    return () => { alive = false; };
  }, [name]);

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full", className)}
      style={{ width: size, height: size }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
