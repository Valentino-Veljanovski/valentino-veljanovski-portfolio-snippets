# Case Study Layout Pattern

A consistent 9-section structure used by every per-project case
study on the portfolio. Each case study is a standalone `.tsx`
file; the layout pattern is what makes them feel like the same
publication.

## Why a fixed structure

A reader who lands on one case study on a portfolio is likely to
read another. If the layouts are inconsistent, every new page
costs them re-orientation. If the layouts are consistent, they
already know where to find what they want.

The trade-off: occasionally a case study deserves a different
shape. The fix is *intentional* deviation, not a free-form layout
each time. Most case studies stick to the template; a few skip
sections that don't apply (e.g. no privacy section for an
internal-only tool).

## The 9 sections

Numbered from `00` to `09`, displayed as small monospace tags in
the design:

```
00 - Header
01 - Project context
02 - Problem statement
03 - Approach
04 - Architecture
05 - Detailed walkthrough
06 - Tools and decisions
07 - Quality & outcomes
08 - Privacy / publication
09 - Proof / Evidence
```

### 00 - Header

The fixed top of the page:
- Project title, in a large display font
- Subtitle / one-line summary
- A pill row with status (e.g. "In production", "Prototype",
  "Concept"), role (e.g. "Sole developer"), and date range
- A back-link to the projects index

This is what loads above the fold. It tells the reader the
gist before they decide to scroll.

### 01 - Project context

Three paragraphs answering: what is this, when did it happen, why
did it happen. The reader's first question is "what am I looking
at"; this section answers it.

### 02 - Problem statement

What was broken before. Stated concretely, with numbers when
available. ("Operations team spent ~3 hours per week
hand-typing service appointment data into Excel" is concrete; "the
process was inefficient" is not.)

### 03 - Approach

The rough plan, stated at the right altitude - high enough that
a reader without context can follow, low enough to be specific.
Usually one paragraph.

### 04 - Architecture

A custom SVG diagram showing the system structure (see
[`svg-architecture-diagrams.md`](./svg-architecture-diagrams.md)),
followed by a short caption explaining the diagram in prose.

This is where most readers will linger. The diagram has to be
clear at a glance and rewarding to study in detail.

### 05 - Detailed walkthrough

The longest section. Each piece of the architecture explained in
its own sub-block:
- **Module name** - what it does
- **Why this design** - the alternative considered and rejected
- **How it integrates with the others**

This is for the reader who wants the technical detail. Skim
material is in 03 and 04; depth is here.

### 06 - Tools and decisions

A two-column table:
- Tools: what was used (n8n, DocuSign, Microsoft Graph, …)
- Decisions: what was chosen *over* an alternative, and why

The decisions column is more interesting than the tools column.
"Used PHPMailer" is a tool choice; "chose PHPMailer over
Nodemailer because the SMTP host was already configured for the
domain and the team is comfortable with PHP" is a decision.

### 07 - Quality & outcomes

What worked, what didn't, what changed over time. Numbers when
available. This section is harder to fake than the others -
specifics build trust.

### 08 - Privacy / publication

What can and can't be shared. For client work, this explains why
certain details are abstracted (customer names, internal
identifiers, environment-specific config). For prototype work,
this notes whether the prototype was deployed publicly.

### 09 - Proof / Evidence

A `<a>` card linking to a companion public repo (separate
"pattern" repo, not the full source), and an inline code excerpt
showing one specific snippet from that repo. Closes the loop:
"here's where you can see actual code".

## Implementation

The 9 sections aren't an enforced framework - there's no
`<CaseStudyTemplate>` that takes 9 props. Each case study is a
hand-written `.tsx` file. The consistency comes from copy-paste
discipline:

- Section headings use `<SectionHead num="04" label="Architecture" title="..." />`
  with the same component
- Each section is wrapped in `<ScrollReveal>` with a small delay
- Code blocks use the same `<pre>` styling
- Tags / pills use the same component

Three primitives shared across all case studies:

- **`<SectionHead>`** - the numbered section header
- **`<ScrollReveal>`** - scroll-triggered fade-in (see
  [`intersection-observer-reveal.md`](./intersection-observer-reveal.md))
- **`<ArchitectureDiagram>`** - SVG flow diagram (see
  [`svg-architecture-diagrams.md`](./svg-architecture-diagrams.md))

Plus a set of CSS variables on `:root` for design tokens:

```css
:root {
  --bg: #0a0e1a;
  --surface: #131826;
  --border: #1f2937;
  --text-1: #e5e7eb;     /* primary text */
  --text-2: #9ca3af;     /* secondary text */
  --text-3: #6b7280;     /* tertiary text / metadata */
  --accent: #00d4a1;     /* primary accent */
  --accent-dim: rgba(0, 212, 161, 0.1);
  --radius: 8px;
  --font-syne: 'Syne', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

These tokens get used everywhere via `style={{ color: 'var(--text-1)' }}`.
Changing one variable updates the whole site. There's no
component library to override.

## When to deviate

The pattern is a default, not a law. Skip sections that don't
apply:

- **Skip 02 (Problem statement)** for case studies that are about
  exploration, not problem-solving.
- **Skip 07 (Quality & outcomes)** for prototypes that never went
  to production - there's nothing to report.
- **Skip 09 (Proof / Evidence)** for case studies that don't have
  a companion repo (e.g., this very portfolio's case study).
- **Combine 02 and 03** when the problem and approach are
  inseparable.

The rule of thumb: deviate when the case study earns it. Don't
deviate to avoid the work of writing a section.

## What this pattern is NOT

- **Not a template repo.** Don't fork this and rename - write your
  own case studies. The pattern is the structure, not the words.
- **Not a CMS schema.** This is hand-edited `.tsx`. For
  content-managed case studies, define a schema in your CMS that
  mirrors the 9 sections.
- **Not a writing rubric.** A boring case study with all 9 sections
  is still boring. The structure is necessary, not sufficient.
