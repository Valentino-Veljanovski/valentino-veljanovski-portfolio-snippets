"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const VT_NAME = "pc-card-active";

type DocumentWithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition: () => void;
  };
};

/**
 * useViewTransitionRouter
 * ========================
 * Returns a navigate function that wraps next/navigation's router.push
 * in document.startViewTransition.
 *
 * - Feature-detects startViewTransition; falls back to plain push.
 * - Skips transition under prefers-reduced-motion (still navigates).
 * - If a source element is provided, assigns view-transition-name
 *   "pc-card-active" to it for the duration of the transition.
 *   The destination page MUST have a matching name on its target
 *   element for the morph to occur.
 * - Name is cleared after the transition finishes (best-effort; if
 *   the source unmounts during nav, the cleanup is a no-op).
 */
export default function useViewTransitionRouter() {
  const router = useRouter();

  return useCallback(
    (href: string, fromElement?: HTMLElement | null) => {
      const doc = document as DocumentWithVT;
      const supported = typeof doc.startViewTransition === "function";
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!supported || reduced) {
        router.push(href);
        return;
      }

      if (fromElement) {
        fromElement.style.viewTransitionName = VT_NAME;
      }

      const transition = doc.startViewTransition!(() => {
        router.push(href);
      });

      transition.finished.finally(() => {
        if (fromElement && fromElement.isConnected) {
          fromElement.style.viewTransitionName = "";
        }
      });
    },
    [router],
  );
}
