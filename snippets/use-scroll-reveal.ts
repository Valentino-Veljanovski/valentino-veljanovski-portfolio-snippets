/**
 * useScrollReveal - IntersectionObserver hook
 * ============================================
 *
 * Returns a ref and a boolean. Attach the ref to any element;
 * the boolean flips to `true` the first time the element scrolls
 * into view, then stays true forever (the observer
 * self-disconnects after the first hit).
 *
 * Use case: trigger CSS transitions when content enters the
 * viewport, without pulling in Framer Motion.
 *
 * Usage:
 *
 *   function Section() {
 *     const { ref, isVisible } = useScrollReveal(0.15);
 *     return (
 *       <div
 *         ref={ref}
 *         style={{
 *           opacity: isVisible ? 1 : 0,
 *           transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
 *           transition: 'opacity 0.7s ease, transform 0.7s ease',
 *         }}
 *       >
 *         …content
 *       </div>
 *     );
 *   }
 *
 * Note: `useScrollReveal` is a Client Component primitive. The
 * file using it must be `"use client"`.
 */

"use client";
import { useEffect, useRef, useState } from "react";

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Fire once, then stop observing - never replay.
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
