# Valentino Veljanovski Portfolio Snippets

A reference for building a personal developer portfolio in Next.js
16:
without Framer Motion, without a UI library, without a CMS, without
a
charting library, and without Three.js - including the WebGL hero
shader
and the View Transitions navigation.

This repository documents the reusable component and hook patterns
behind [valentinoveljanovski.de](https://valentinoveljanovski.de).
The
portfolio is itself a public site, what's documented here is the
**why**
behind specific implementation choices, plus the generic,
copy-paste-ready versions of the components that aren't tied to my
content.

> The full source code of the portfolio website is not published
here.
> This repository contains documentation and selected pattern
snippets,
> not a clone-and-deploy template. The content (case studies, copy,
> project lists) is mine, lives at the live URL, and is not
> re-distributed.

---

## What this repo documents

A lot of "developer portfolio templates" lean hard on Framer Motion,
shadcn/ui, GSAP, Three.js, and one of a dozen template repos. The
portfolio this repo references deliberately does none of that. It
uses:

- **Custom IntersectionObserver hook** instead of Framer Motion:
    lighter bundle, no animation library dependency, full control over
    timing. The observer self-disconnects after the first hit so
    scrolling up and back down doesn't replay the reveal.
- **View Transitions API navigation hook** instead of a routing or
    animation library: wraps Next.js App Router `router.push` in
    `document.startViewTransition` so a clicked project card morphs
into
    the case-study header using only browser-native APIs.
Feature-detected;
    falls back to plain navigation on older browsers and under
    `prefers-reduced-motion`. The matching pair is declared via a
    shared `view-transition-name` on source card and destination
header.
- **Hand-written WebGL hero shader** instead of Three.js: a ~30-line
    GLSL fragment shader with FBM noise drives the hero ambient
    background. Six hard mount guards (reduced-motion,
    `pointer: coarse`, viewport width, GL context acquisition, shader
    compile/link, `webglcontextlost`) so the experience degrades to a
    CSS conic-gradient fallback whenever any guard fails. Source is
    ~5 KB vs Three.js (~150 KB).
- **SplitText per-letter reveal** instead of a typography library:
    renders each character as an `inline-block` span with a staggered
    `animation-delay`. `aria-label` on the parent preserves the full
    string for screen readers; the per-character spans are
    `aria-hidden`. A nowrap wrapper keeps multi-letter words from
    breaking across lines on narrow viewports.
- **Seamless CSS marquee with inline brand SVGs** instead of an icon
    font or a carousel library: a duplicated-track loop using
    `transform: translateX(0 → -50%)` with edge `mask-image` gradient
    paths (no `@simpleicons` package, no icon font CDN).
Pause-on-hover
    gated behind `(hover: hover)`; pauses entirely when the parent
    section is off-screen via IntersectionObserver.
- **Scroll-progress ring** driven by SVG `stroke-dashoffset` instead
    of a progress library: a 2 px accent ring around the back-to-top
    button fills clockwise as the user scrolls. State updates via a
    rAF-throttled scroll handler.
- **Custom SVG architecture diagrams** instead of a charting
library:
    every case study has a unique flow, generic chart components don't
    fit, drawing in SVG is faster than fighting a generic API.
- **State-machine typewriter** instead of a typewriter library, it's
    ~30 lines of TypeScript, supports cycling through multiple strings
    with typing / waiting / deleting phases. Pauses when the hero is
    off-screen or the tab is hidden.
- **Consistent 9-section case study layout** instead of a CMS, each
    case study is a `.tsx` file that imports a small set of
primitives.
    New case studies copy the structure; deviations are intentional.

Across all patterns: every effect respects `prefers-reduced-motion`
(global clamp on transitions, animations, and scroll-behavior), and
hover behaviour is gated behind
`@media (hover: hover) and (pointer: fine)` so touch devices never
get
sticky hover.

The patterns documented here are the parts that another developer
might
want to lift for their own portfolio without dragging in the
specific
content.

---

## Repository structure

```
.
|-- README.md
|-- package.json
|-- tsconfig.json
|-- docs/
|   |-- architecture.md
|   |-- case-study-layout-pattern.md
|   |-- intersection-observer-reveal.md
|   `-- svg-architecture-diagrams.md
`-- snippets/
    |-- README.md
    |-- architecture-diagram.tsx
    |-- back-to-top-progress.tsx
    |-- hero-shader.tsx
    |-- reading-progress.tsx
    |-- scroll-reveal-wrapper.tsx
    |-- split-text.tsx
    |-- typewriter-cycle.tsx
    |-- use-scroll-reveal.ts
    `-- use-view-transition-router.ts
```

The repository contains selected reusable patterns from the live portfolio. Private portfolio copy, project data, visual assets, and full case-study source files are intentionally not included.

---

## Tech stack

- **Framework:** Next.js 16 (App Router) on React 19
- **Language:** TypeScript
- **Styling:** CSS variables on `:root` + `style={{...}}` inline
props +
    styled-jsx via `dangerouslySetInnerHTML` for keyframes and media
    queries. Tailwind is imported in `globals.css` for its base reset
    only; no utility classes are used in components.
- **Animation:** Native IntersectionObserver, View Transitions API,
    CSS keyframes, `mask-image` gradients, SVG `stroke-dashoffset`
- **Graphics:** Hand-written WebGL fragment shader (no Three.js, no
    OGL), inline Simple Icons SVG paths for brand logos
- **Hosting:** Vercel

The "minimal Tailwind" choice surprises people. The reasoning: a
portfolio is mostly long-form text, not utility-heavy UI. Inline
styles
+ styled-jsx + a small set of CSS variables for design tokens gives
full type-safety, keeps the design language consistent via tokens,
and
avoids utility-class noise across components. Tailwind stays
imported
for its CSS reset only. For a UI component library, going all-in on
Tailwind would be the right answer; for a portfolio, it isn't.

The "no animation library" choice is the deliberate parallel. Framer
Motion adds ~30 KB gzipped to do what an IntersectionObserver + a
CSS
transition does in a 25-line hook. GSAP adds more. The custom
approach
also runs the visible animations off the main thread (CSS keyframes,
GPU transforms) rather than via `requestAnimationFrame` in JS -
which
matters when the browser is also painting a new route or running
hydration.

The WebGL shader is the one place where doing it from scratch is
harder
than reaching for a library - Three.js would be ~30 lines to set
this
up. The hand-written version is ~200 lines including all six mount
guards, the rAF loop, the IntersectionObserver pause, the
`visibilitychange` pause, the `webglcontextlost` handler, and the GL
cleanup. It ships at ~5 KB instead of ~150 KB and demonstrates that
the
underlying browser API is well understood.

---

## What this repo does NOT contain

Scope of this repository:

- **The case study content.** Every case study on the live site is a
    hand-written `.tsx` file with detailed architecture documentation.
    Those files live in the private portfolio repo and are not
republished
    here. They link back to *other* public pattern repositories that
    contain code snippets and architecture documentation.
- **The Hero copy, About copy, contact form copy.** These are
personal
    content.
- **The full Hero section integration.** The reusable `hero-shader.tsx` snippet is included here, but the exact page copy, accent palette, positioning, fallback styling, and visual assets remain in the private portfolio repo.
- **CV PDF.** Lives at the live site under
`/valentino-veljanovski-cv.pdf`.
- **Custom assets.** Logos, illustrations, fonts.

---

## About

Built by [Valentino Veljanovski](https://valentinoveljanovski.de), automation developer based in Munich. The live case study for this portfolio is available at [valentinoveljanovski.de/projects/valentino-veljanovski-portfolio-snippets](https://valentinoveljanovski.de/projects/valentino-veljanovski-portfolio-snippets).

Companion repositories cover related patterns:

- [`Valentino-Veljanovski/multi-region-dispatch-automation-snippets`](https://github.com/Valentino-Veljanovski/multi-region-dispatch-automation-snippets): Microsoft 365, DocuSign, Slack, and n8n dispatch automation patterns.
- [`Valentino-Veljanovski/internal-reclamation-case-management-snippets`](https://github.com/Valentino-Veljanovski/internal-reclamation-case-management-snippets): Slack-based reclamation case management dashboard patterns.
- [`Valentino-Veljanovski/consent-based-3d-scan-control-center-snippets`](https://github.com/Valentino-Veljanovski/consent-based-3d-scan-control-center-snippets): Role-based Slack control center for consent-first 3D scan operations.
- [`Valentino-Veljanovski/bauscope-3d-web-snippets`](https://github.com/Valentino-Veljanovski/bauscope-3d-web-snippets): Next.js B2B landing page patterns.
- [`Valentino-Veljanovski/company-web-page-snippets`](https://github.com/Valentino-Veljanovski/company-web-page-snippets): PHP, Apache, and service worker patterns.

---
## Viewing Notice

This repository is published for portfolio demonstration and
educational
viewing only.

All code, documentation, diagrams, and content in this repository
remain
the intellectual property of the author. **All rights reserved.**

No license is granted, expressed or implied, for reuse,
redistribution,
modification, or commercial use of any material in this repository
without prior written permission from the author.

For licensing or collaboration inquiries, contact:
<valentinoveljanovski@outlook.com>
