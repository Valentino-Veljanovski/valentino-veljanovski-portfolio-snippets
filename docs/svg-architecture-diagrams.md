# Custom SVG Architecture Diagrams

A small React component that renders a flow diagram from a list
of nodes (with grid coordinates) and edges. No D3, no charting
library, no Mermaid runtime - just SVG output from raw input
data.

## Why custom

The case studies on this portfolio each have a different system
shape, and the architecture diagram is a major part of each one.
Generic charting libraries (D3 force layouts, vis.js, Mermaid)
work but always feel slightly off:

- **Auto-layout fights you.** A force-directed layout produces a
  different shape every render - fine for exploration, awful for
  publication. Mermaid's auto-layout is more predictable but
  produces "looks like Mermaid" diagrams that all blur together.
- **Styling is fragile.** Theme changes mean fighting the
  library's CSS. Custom hover states, animations on specific
  nodes, conditional highlighting - all become exceptions.
- **Bundle cost.** D3 + react-d3-graph or similar is 100kB+ for
  what amounts to "draw rectangles and arrows".

The pattern here:

- **Manual node placement** via `row` and `col` coordinates on
  each node - the author decides exactly where each node sits.
- **Manual edge list** - explicit `from → to` pairs, not
  auto-routed.
- **Direct SVG output** - full control over rendering, hover
  states, and animations.

The cost: the author has to think about the layout, not the tool.
For 8 case studies with ~10 nodes each, this is faster than
fighting a library.

## API

```tsx
interface FlowNode {
  id: string;
  label: string;
  row: number;   // 0 = top
  col: number;   // 0 = leftmost
}

interface FlowEdge {
  from: string;  // node id
  to: string;    // node id
}

<ArchitectureDiagram
  nodes={[
    { id: "trigger", label: "Webhook trigger", row: 0, col: 1 },
    { id: "validate", label: "Validate input", row: 1, col: 0 },
    { id: "transform", label: "Transform data", row: 1, col: 1 },
    { id: "store", label: "Persist to DB", row: 1, col: 2 },
    { id: "notify", label: "Slack notification", row: 2, col: 1 },
  ]}
  edges={[
    { from: "trigger", to: "validate" },
    { from: "trigger", to: "transform" },
    { from: "trigger", to: "store" },
    { from: "validate", to: "notify" },
    { from: "transform", to: "notify" },
    { from: "store", to: "notify" },
  ]}
  cols={3}
  caption="Architecture diagram of the data ingestion pipeline."
/>
```

The component computes:
- Total SVG width from `cols × (NODE_WIDTH + COL_GAP)`
- Total SVG height from `max(row) × (NODE_HEIGHT + ROW_GAP)`
- Each node's pixel position from `row` × row-height + `col` ×
  col-width
- Each edge as a straight line between two node centers, with an
  arrow marker at the destination

## Layout primitives

```ts
const NODE_W   = 160;   // node width in SVG units
const NODE_H   = 46;    // node height
const ROW_GAP  = 32;    // vertical gap between rows
const COL_GAP  = 20;    // horizontal gap between columns
```

Tune these for your visual style. Wider nodes hold more text;
taller gaps make the diagram feel less dense.

## Why row/col instead of x/y pixels

The temptation when building this kind of component is to let the
author specify exact pixel positions: `{ id: "foo", x: 240, y: 80 }`.
That gives full freedom but produces inconsistent diagrams across
case studies - different nodes, different sizes.

Forcing row/col coordinates means:

- All diagrams use the same node size
- All diagrams use the same row/column spacing
- Diagrams from different case studies look like they belong to
  the same publication
- Adding or removing nodes only changes layout in predictable ways

The cost: occasionally a node *should* be slightly off-grid. For
those cases, accept the constraint and rearrange the rest of the
diagram. The visual consistency across the portfolio is worth it.

## Edge routing

Edges are straight lines between node centers. No bends, no
auto-routing. If two nodes overlap when connected (e.g. a node
in row 0 col 0 connecting to row 0 col 2 - the line passes
through col 1's node), the fix is to rearrange, not to add edge
routing.

For diagrams where straight edges genuinely don't work, use a
real graph library. For most architectural diagrams, they do.

## Hover state

The component supports hover highlighting:

```css
.ad-svg-node:hover rect { stroke: var(--accent); stroke-width: 1.5; }
.ad-svg-node:hover text { fill: var(--accent); }
.ad-svg-node.is-hovered rect { filter: drop-shadow(0 0 12px rgba(...)); }
```

Hovering a node:
- Highlights its border in accent color
- Highlights its label in accent color
- Adds a subtle drop shadow

This is implemented in plain CSS injected via
`dangerouslySetInnerHTML` at the component root - no `<style
jsx>` or runtime CSS-in-JS. The styles only apply within the SVG
because the selectors are scoped to `.ad-svg-node`.

## Text wrapping

Node labels longer than ~14 characters get word-wrapped into up
to 3 lines:

```ts
function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (current && (current + " " + w).length > maxChars) {
      lines.push(current);
      current = w;
    } else {
      current = current ? current + " " + w : w;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);  // truncate at 3 lines
}
```

If a label needs more than 3 lines, it's the wrong label -
shorten it instead of cramming text in.

## Mobile

SVG with a fixed `viewBox` and `width="100%"` is responsive by
default. The diagram scales down on narrow screens; text remains
proportional. For very narrow viewports, wrap the SVG in a
horizontally-scrolling container so labels don't become unreadable:

```tsx
<div style={{ overflowX: "auto" }}>
  <svg viewBox={...} width="100%" style={{ maxWidth: `${totalW}px` }}>
    ...
  </svg>
</div>
```

The `maxWidth` prevents the SVG from being scaled up beyond its
intended size on wide screens, where it would look too sparse.

## What this pattern is NOT

- **Not for dense graphs.** If your diagram has 50+ nodes, use
  D3. The manual-positioning model breaks down.
- **Not for animated state diagrams.** This shows static
  structure, not transitions. For animated state machines, use
  a library like XState's visualizer.
- **Not interactive in the sense of "click a node to drill in".**
  It's a publication artifact, not an exploration tool. For that,
  use a real diagram tool.

## See also

The full snippet is in
[`../snippets/architecture-diagram.tsx`](../snippets/architecture-diagram.tsx).
