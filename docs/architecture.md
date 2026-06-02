# Architecture

A Next.js 16 App Router site, structured as one home page + a
fixed set of per-project case study pages, with a small library of
custom hooks and components shared across them.

The interesting decisions are about *what to leave out* - no UI
framework, no animation library, no CMS - and how the pieces that
remain stay maintainable.

## High-level shape

```
┌── app/ ─────────────────────────────────────────────────────────┐
│                                                                  │
│  layout.tsx              ← root layout, fonts, metadata defaults │
│  page.tsx                ← home page (composes section components)│
│                                                                  │
│  projects/[slug]/page.tsx← dynamic case study page               │
│  projects/multi-region-dispatch-automation/         ← per-project case study folder         │
│    └── MultiRegionDispatchCaseStudy.tsx                                        │
│  projects/internal-reclamation-case-management-dashboard/                                           │
│  projects/consent-based-3d-scan-control-center/                                       │
│  projects/digital-signature-workflow-automation/                                    │
│  projects/3d-service-landing-page-prototype/                                      │
│  projects/corporate-website/                                     │
│  projects/valentino-veljanovski-portfolio-snippets/                                             │
│                                                                  │
│  impressum/page.tsx      ← required German legal page            │
│  datenschutz/page.tsx    ← privacy policy                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌── components/ ──────────────────────────────────────────────────┐
│                                                                  │
│  Hero, About, Experience, Projects, Contact   ← home sections   │
│  Nav, Page, SocialSidebar                     ← layout           │
│  ScrollReveal, ArchitectureDiagram            ← shared primitives│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌── hooks/ ───────────────────────────────────────────────────────┐
│                                                                  │
│  useScrollReveal.ts       ← IntersectionObserver helper          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌── data/ ────────────────────────────────────────────────────────┐
│                                                                  │
│  projects.ts             ← project list (slug, title, summary…)  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Why no UI framework

A portfolio is mostly long-form text wrapped in some chrome. Tailwind
or a UI kit makes sense when you have many small interactive UI
components (buttons, dropdowns, modals, forms). For a portfolio:

- The interactive surface is almost zero - a contact form, a nav
  menu. That's it.
- The content surface is huge - long case studies with custom
  layouts per project.

CSS variables on `:root` plus inline `style={{...}}` props give:

- Type-checked styles (TypeScript catches typos in property names)
- Per-component scope (no global stylesheet to reason about)
- Zero build-tool friction (no Tailwind config, no purge step)
- Easy variable references (`color: 'var(--accent)'`)

The trade-off: there's some repetition (the same button style
inlined in three places). The portfolio has 8 pages; that's
manageable. For a 50-component design system, this would not be
the right call.

## Why no animation library

Most "scroll into view" animations on a portfolio are: opacity 0
→ 1, translateY(20px) → 0, over 0.7s. That's two CSS properties
and a transition. Pulling in Framer Motion (~30kB gzipped) for
that is overkill.

The custom `useScrollReveal` hook does the same thing in 25 lines
of TypeScript using native `IntersectionObserver`:

```ts
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
```

See [`intersection-observer-reveal.md`](./intersection-observer-reveal.md)
for the full pattern, including the wrapper component, gotchas,
and reduced-motion handling.

## Why no CMS

The portfolio's content is:

- 8 pages of long-form case study writing, each with custom
  architecture diagrams
- 1 hero section, 1 about section, 1 experience section
- A contact form

Of those, the case studies are the only thing that grows over
time. Even there: a new case study is added every few months at
most, and each one needs custom diagrams that no CMS schema would
naturally express.

A `.tsx` file per case study is the right shape:

- Full TypeScript autocomplete and type-checking on the structure
- Each case study can deviate from the template where it should
- Diagrams are just SVG components imported alongside the prose
- Version control gives diff view of edits over time

The cost: editing requires running the dev server and committing.
Worth it for content this slow-changing. For a content-heavy
marketing site that updates weekly, use a real CMS.

## Per-project case study structure

Every case study in `projects/<slug>/` follows the same 9-section
layout:

```
00 - Header with title, status, role
01 - Project context (what, why, when)
02 - Problem statement
03 - Approach (high-level)
04 - Architecture (with custom SVG diagram)
05 - Detailed walkthrough
06 - Tools and decisions
07 - Quality & outcomes
08 - Privacy / publication notes
09 - Proof / Evidence (links to companion pattern repos)
```

This consistency is deliberate. A reader who's read one case
study knows exactly where to find specific information in the
next. New case studies copy the structure and fill in the content;
deviation is intentional, not accidental.

See [`case-study-layout-pattern.md`](./case-study-layout-pattern.md)
for the full pattern.

## What's not in this architecture

Things this portfolio deliberately doesn't have:

- **No analytics.** Adding Plausible or Umami is a one-line
  decision; it's not added by default.
- **No comments / interactions.** This is a one-way
  write-by-the-owner medium.
- **No login.** No reason to have it.
- **No A/B testing.** Same reason.
- **No internationalization framework.** German legal pages are
  hardcoded; everything else is in English.
- **No newsletter.** Not the point of this site.
