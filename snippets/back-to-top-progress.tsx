"use client";

/**
 * BackToTop: Smooth scroll-to-top button
 * ========================================
 *
 * Circular floating button bottom-right of the viewport. Fades in
 * after the user scrolls past 400px. Smooth scroll to top on click
 * (JS-driven, doesn't break with #-anchor URL pollution).
 *
 * Behavior:
 *   - Hidden by default (opacity 0, translateY 12px)
 *   - Animates in when scrolled past threshold
 *   - Click: smooth scroll to top + brief click feedback
 *   - Hover: lift + glow + arrow bounce
 *   - Respects prefers-reduced-motion (skips smooth transitions)
 *   - Removed from tab order + a11y tree while hidden
 *
 * Drop-in replacement for any prior BackToTop. Used in app/layout.tsx.
 */

import { useEffect, useState, useCallback } from "react";

const SHOW_THRESHOLD = 400; // px from top before button appears
const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // ── Show/hide + track scroll progress ──
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        setProgress(p);
        setVisible(window.scrollY > SHOW_THRESHOLD);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll(); // fire once on mount

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ── Smooth scroll to top ──
  const handleClick = useCallback(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .back-to-top {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 100;
          width: 48px;
          height: 48px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,212,161,0.14) 0%, rgba(0,212,161,0.06) 100%);
          border: 1px solid rgba(0, 212, 161, 0.4);
          border-radius: 50%;
          cursor: pointer;
          color: var(--accent, #00d4a1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.4),
            0 0 16px rgba(0, 212, 161, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          opacity: 0;
          transform: translateY(12px) scale(0.9);
          pointer-events: none;
          transition:
            opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
            background 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }
        .back-to-top.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .back-to-top:focus-visible {
          outline: 2px solid var(--accent, #00d4a1);
          outline-offset: 4px;
        }
        .back-to-top:active {
          transform: translateY(-1px) scale(0.98);
          transition-duration: 0.1s;
        }

        /* Arrow icon */
        .back-to-top-arrow {
          width: 18px;
          height: 18px;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }
        @keyframes btt-bounce {
          0%, 100% { transform: translateY(-3px); }
          50% { transform: translateY(-6px); }
        }

        /* Scroll-progress ring */
        .back-to-top-progress {
          position: absolute;
          inset: -6px;
          width: calc(100% + 12px);
          height: calc(100% + 12px);
          pointer-events: none;
          overflow: visible;
        }
        .back-to-top-progress-track {
          fill: none;
          stroke: rgba(0, 212, 161, 0.15);
          stroke-width: 1.5;
        }
        .back-to-top-progress-bar {
          fill: none;
          stroke: var(--accent);
          stroke-width: 2;
          stroke-linecap: round;
          transition: stroke-dashoffset 250ms cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 0 4px rgba(0, 212, 161, 0.5));
        }

        @media (hover: hover) and (pointer: fine) {
          .back-to-top:hover {
            background: linear-gradient(135deg, rgba(0,212,161,0.24) 0%, rgba(0,212,161,0.12) 100%);
            border-color: rgba(0, 212, 161, 0.8);
            box-shadow:
              0 8px 28px rgba(0, 0, 0, 0.5),
              0 0 32px rgba(0, 212, 161, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            transform: translateY(-3px) scale(1.05);
          }
          .back-to-top:hover svg.back-to-top-arrow {
            transform: translateY(-3px);
            animation: btt-bounce 0.8s ease-in-out infinite;
          }
        }

        /* Mobile: smaller */
        @media (max-width: 640px) {
          .back-to-top {
            bottom: 16px;
            right: 16px;
            width: 42px;
            height: 42px;
          }
          .back-to-top-arrow {
            width: 16px;
            height: 16px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .back-to-top,
          .back-to-top-arrow,
          .back-to-top-progress-bar {
            transition: none !important;
            animation: none !important;
          }
          .back-to-top:hover .back-to-top-arrow {
            transform: none;
          }
        }
      `,
        }}
      />
      <button
        type="button"
        onClick={handleClick}
        className={`back-to-top ${visible ? "is-visible" : ""}`}
        aria-label="Scroll to top"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
      >
        <svg
          className="back-to-top-progress"
          viewBox="0 0 60 60"
          aria-hidden="true"
        >
          <circle
            className="back-to-top-progress-track"
            cx="30"
            cy="30"
            r={RING_RADIUS}
          />
          <circle
            className="back-to-top-progress-bar"
            cx="30"
            cy="30"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
            transform="rotate(-90 30 30)"
          />
        </svg>
        <svg
          className="back-to-top-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
