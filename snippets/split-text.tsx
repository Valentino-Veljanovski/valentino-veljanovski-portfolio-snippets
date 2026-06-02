"use client";

interface SplitTextProps {
  text: string;
  /** Delay offset (ms) before this segment's stagger starts. */
  offset?: number;
}

const STAGGER_MS = 28;

/**
 * SplitText
 * ==========
 * Renders each character of `text` as an inline-block span with a
 * staggered `animation-delay`. The consuming stylesheet must define
 * `.splittext-char` with the entrance keyframe.
 *
 * Accessibility: char spans are aria-hidden. The PARENT element
 * (h1/h2/etc.) MUST carry an aria-label with the full readable text
 * for screen readers.
 */
export default function SplitText({ text, offset = 0 }: SplitTextProps) {
  const chars = Array.from(text);
  return (
    <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="splittext-char"
          style={{ animationDelay: `${offset + i * STAGGER_MS}ms` }}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
