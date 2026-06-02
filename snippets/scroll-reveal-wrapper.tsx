/**
 * ScrollReveal - wrapper component
 * =================================
 *
 * Wraps children with a fade-and-slide-up CSS transition that
 * triggers when the element scrolls into view. Uses the
 * `useScrollReveal` hook internally.
 *
 * Usage:
 *
 *   <ScrollReveal>
 *     <h2>Heading</h2>
 *   </ScrollReveal>
 *   <ScrollReveal delay={0.1}>
 *     <p>Paragraph 1.</p>
 *   </ScrollReveal>
 *   <ScrollReveal delay={0.2}>
 *     <p>Paragraph 2.</p>
 *   </ScrollReveal>
 *
 * The `delay` prop staggers child reveals - each cascades 0.1s
 * after the previous, without per-child manual timing.
 *
 * Production reminder: this version does NOT respect the
 * `prefers-reduced-motion: reduce` media query. For accessibility,
 * detect that preference and skip the animation when set. See
 * docs/intersection-observer-reveal.md for the pattern.
 */

"use client";
import { useScrollReveal } from "./use-scroll-reveal";

export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal(0.12);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
