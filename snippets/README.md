# Code Snippets

Selected reusable patterns from the live portfolio source, sanitized and generalized for reuse in a Next.js 16 App Router project.

| File | Purpose |
|---|---|
| `use-scroll-reveal.ts` | IntersectionObserver hook that flips a boolean once an element enters the viewport. |
| `scroll-reveal-wrapper.tsx` | `<ScrollReveal>` wrapper that applies CSS transitions around the hook. |
| `use-view-transition-router.ts` | Hook wrapping `next/navigation` router pushes with the browser View Transitions API. |
| `hero-shader.tsx` | Hand-written WebGL FBM-noise hero background with reduced-motion, pointer, viewport, GL, shader, and context-loss guards. |
| `split-text.tsx` | Per-letter reveal helper. The consuming stylesheet defines `.splittext-char`. |
| `back-to-top-progress.tsx` | Floating scroll-to-top button with SVG progress ring. |
| `reading-progress.tsx` | Thin fixed reading-progress bar driven by `requestAnimationFrame` scroll updates. |
| `typewriter-cycle.tsx` | Role-cycling typewriter state machine. |
| `architecture-diagram.tsx` | SVG flow diagram component with manual row/column node placement. |

## Conventions

- Snippets target Next.js 16 App Router and React 19 with TypeScript.
- Components that use browser APIs are marked `"use client"`.
- Styling uses inline `style={{...}}`, scoped CSS, or consuming-page CSS classes.
- Animated patterns respect `prefers-reduced-motion` where motion is controlled locally.
- Color tokens such as `var(--accent)` are expected to exist in the consuming app.

## Notes

The live portfolio also contains page-specific composition, project data, copy, and assets. Those are not included here because this repository is a pattern reference, not a clone of the private portfolio source.
