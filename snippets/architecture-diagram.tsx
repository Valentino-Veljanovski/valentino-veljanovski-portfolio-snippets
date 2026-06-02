/**
 * ArchitectureDiagram - SVG flow diagram on a row/col grid
 * =========================================================
 *
 * Renders a flow diagram from a list of nodes (with grid
 * coordinates) and a list of edges (from → to id pairs). No
 * auto-layout, no D3, no charting library - just SVG output from
 * raw input data.
 *
 * Why grid coordinates instead of pixel coordinates: forces visual
 * consistency across many diagrams. Every diagram in the project
 * uses the same node size, same row/col spacing.
 *
 * Usage:
 *
 *   <ArchitectureDiagram
 *     nodes={[
 *       { id: "trigger",    label: "Webhook trigger",     row: 0, col: 1 },
 *       { id: "validate",   label: "Validate input",       row: 1, col: 0 },
 *       { id: "transform",  label: "Transform data",       row: 1, col: 1 },
 *       { id: "store",      label: "Persist to DB",        row: 1, col: 2 },
 *       { id: "notify",     label: "Slack notification",   row: 2, col: 1 },
 *     ]}
 *     edges={[
 *       { from: "trigger",   to: "validate"  },
 *       { from: "trigger",   to: "transform" },
 *       { from: "trigger",   to: "store"     },
 *       { from: "validate",  to: "notify"    },
 *       { from: "transform", to: "notify"    },
 *       { from: "store",     to: "notify"    },
 *     ]}
 *     cols={3}
 *     caption="Data ingestion pipeline."
 *   />
 *
 * Tunable layout primitives at the top of the file. Adjust to
 * suit your visual style.
 */

"use client";
import { useState } from "react";

interface FlowNode {
  id: string;
  label: string;
  row: number;
  col: number;
}

interface FlowEdge {
  from: string;
  to: string;
}

interface ArchitectureDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  cols?: number;
  caption: string;
}

// ── Layout primitives ────────────────────────────────────────
const NODE_W = 160;
const NODE_H = 46;
const ROW_GAP = 32;
const COL_GAP = 20;

// ── Compute the pixel position of a node ─────────────────────
function getNodePos(
  node: FlowNode,
  cols: number,
  totalW: number,
): { cx: number; cy: number; x: number; y: number } {
  const slotW = totalW / cols;
  const cx = slotW * node.col + slotW / 2;
  const cy = 40 + node.row * (NODE_H + ROW_GAP) + NODE_H / 2;
  return { cx, cy, x: cx - NODE_W / 2, y: cy - NODE_H / 2 };
}

// ── Word-wrap a label into up to 3 lines ─────────────────────
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
  return lines.slice(0, 3);
}

export default function ArchitectureDiagram({
  nodes,
  edges,
  cols = 3,
  caption,
}: ArchitectureDiagramProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const totalW = cols * (NODE_W + COL_GAP);
  const maxRow = Math.max(...nodes.map((n) => n.row));
  const totalH = 40 + (maxRow + 1) * (NODE_H + ROW_GAP) + 20;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .ad-svg-node { cursor: default; transition: filter 0.3s; }
            .ad-svg-node:hover rect { stroke: #00d4a1 !important; stroke-width: 1.5 !important; }
            .ad-svg-node:hover text { fill: #00d4a1 !important; }
            .ad-svg-node.is-hovered rect { stroke: #00d4a1 !important; filter: drop-shadow(0 0 12px rgba(0,212,161,0.2)); }
          `,
        }}
      />
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          marginTop: "8px",
        }}
      >
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          width="100%"
          style={{
            display: "block",
            maxWidth: `${totalW}px`,
            margin: "0 auto",
          }}
        >
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="ad-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#6b7280" />
            </marker>
          </defs>

          {/* Edges (drawn first so nodes overlap them at endpoints) */}
          {edges.map((edge, idx) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;
            const from = getNodePos(fromNode, cols, totalW);
            const to = getNodePos(toNode, cols, totalW);
            return (
              <line
                key={idx}
                x1={from.cx}
                y1={from.cy + NODE_H / 2}
                x2={to.cx}
                y2={to.cy - NODE_H / 2}
                stroke="#6b7280"
                strokeWidth="1"
                markerEnd="url(#ad-arrow)"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = getNodePos(node, cols, totalW);
            const lines = wrapText(node.label, 18);
            const isHovered = hovered === node.id;
            return (
              <g
                key={node.id}
                className={`ad-svg-node ${isHovered ? "is-hovered" : ""}`}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={6}
                  fill="#131826"
                  stroke="#1f2937"
                  strokeWidth={1}
                />
                {lines.map((line, idx) => (
                  <text
                    key={idx}
                    x={pos.cx}
                    y={pos.cy + (idx - (lines.length - 1) / 2) * 14 + 4}
                    fill="#e5e7eb"
                    fontSize="11"
                    fontFamily="system-ui, sans-serif"
                    textAnchor="middle"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {caption && (
        <p
          style={{
            color: "#9ca3af",
            fontSize: "0.78rem",
            lineHeight: 1.6,
            textAlign: "center",
            marginTop: "12px",
            fontStyle: "italic",
          }}
        >
          {caption}
        </p>
      )}
    </>
  );
}
