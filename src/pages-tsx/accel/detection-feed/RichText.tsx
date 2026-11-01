import type { Part } from "./data";

/** Renders a description: plain text, `code` ids in a mono chip, and the finding highlighted. */
export function RichText({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.t === "code" ? (
          <code key={i} className="rounded bg-primary-invert-soft px-1.5 py-0.5 font-mono text-xs text-primary">
            {p.v}
          </code>
        ) : p.t === "hl" ? (
          <span key={i} className="font-medium text-warning">
            {p.v}
          </span>
        ) : (
          <span key={i}>{p.v}</span>
        ),
      )}
    </>
  );
}
