# Scroll Reveal Without Framer Motion

The standard "fade-and-slide on scroll" animation pattern,
implemented in 25 lines of TypeScript using the native
`IntersectionObserver` API. No Framer Motion, no animation
library, no scroll-event listeners.

## What this replaces

The Framer Motion equivalent looks like this:

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.15 }}
  transition={{ duration: 0.7 }}
>
  ...content
</motion.div>
```

That's elegant. It also pulls in Framer Motion (~30kB gzipped)
plus its peer `motion/react` runtime. For a portfolio that uses
this pattern in ~50 places and uses no other Framer Motion features,
that's a lot of bundle for not much value.

## The replacement

A custom hook does the IntersectionObserver work:

```ts
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
          observer.unobserve(el);  // fire once, never again
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
```

A wrapper component uses the hook to apply CSS transitions when
the boolean flips:

```tsx
"use client";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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
```

Total: ~50 lines of TypeScript. Zero dependencies.

## Knobs that matter

**`threshold: 0.15`** - fire when 15% of the element is in view.
A fraction of element area, not a pixel value. Lower (0.05) =
fires almost immediately, animation can be missed if user scrolls
fast. Higher (0.5) = fires later, can feel laggy. 0.12–0.15 is a
good default for blocks of content; lower for short elements,
higher for very tall ones.

**`observer.unobserve(el)` after firing** - critical. Without it,
scrolling up and back down triggers the observer again, and
without `once: true` the animation replays. The hook is
"fire-and-forget by design" - the IntersectionObserver disconnects
itself after the first hit.

**`delay` prop** - stagger child reveals by passing different
delays:

```tsx
<ScrollReveal>
  <h2>Heading</h2>
</ScrollReveal>
<ScrollReveal delay={0.1}>
  <p>Paragraph 1.</p>
</ScrollReveal>
<ScrollReveal delay={0.2}>
  <p>Paragraph 2.</p>
</ScrollReveal>
```

Each child reveals 0.1s after its sibling. Cascades feel
intentional without per-child manual timing logic.

## Gotchas

**SSR / hydration.** The component is `"use client"` because it
uses `useEffect`. On first render (SSR), `isVisible` is `false`,
so the element renders with `opacity: 0`. Then on client mount,
the observer attaches. If the element is *already* in the
viewport on page load (e.g., the hero), it animates *in* from
opacity 0, which can feel like an FOUC.

Two solutions:
1. Don't wrap above-the-fold content in `ScrollReveal`. Animate
   it with regular CSS keyframes triggered on mount instead.
2. Use `useLayoutEffect` instead of `useEffect` (fires before
   paint). But that throws SSR warnings - needs careful
   `typeof window !== 'undefined'` guarding.

The first solution is cleaner. Don't animate the hero.

**Reduced motion.** Users with `prefers-reduced-motion: reduce`
should see content without animation. The wrapper doesn't handle
this by default - it should:

```tsx
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const { ref, isVisible } = useScrollReveal(0.12);
const shouldShow = prefersReducedMotion || isVisible;

style={{
  opacity: shouldShow ? 1 : 0,
  transform: shouldShow ? "translateY(0)" : "translateY(24px)",
  transition: prefersReducedMotion
    ? "none"
    : `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
}}
```

A real production version of this hook would include reduced-motion
handling. Worth adding before shipping to users.

**Multiple observers.** Each `<ScrollReveal>` creates its own
`IntersectionObserver` instance. For a page with 50 reveals,
that's 50 observers. Browsers handle this fine (the API is
explicitly designed for many concurrent observers), but if you
notice perf issues on very long pages, you can share a single
observer across instances using a context.

## When to use Framer Motion instead

If you need any of these, Framer Motion is the right call:

- Layout animations (item reordering, expanding cards)
- Drag interactions
- Spring physics, not linear easing
- AnimatePresence (animating elements as they unmount)
- Variants and orchestration across many children

For "fade in on scroll", custom is fine.

## Performance

`IntersectionObserver` is much cheaper than scroll-event-based
detection. The browser computes intersections off the main thread
when it can. For a page with 50 reveal blocks, total overhead is
imperceptible.

CSS transitions also run off the main thread for transform and
opacity. Animating other properties (top, left, width) would
trigger layout and paint on every frame, which kills performance.
Stick to `opacity` and `transform`.

See the full snippets in
[`../snippets/use-scroll-reveal.ts`](../snippets/use-scroll-reveal.ts)
and
[`../snippets/scroll-reveal-wrapper.tsx`](../snippets/scroll-reveal-wrapper.tsx).
