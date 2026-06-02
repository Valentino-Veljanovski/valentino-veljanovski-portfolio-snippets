/**
 * TypewriterCycle - role-cycling typewriter
 * ==========================================
 *
 * Cycles through a list of strings with a state-machine animation:
 *   typing → waiting → deleting → next role → typing → …
 *
 * Renders the current state via React state, but the state machine
 * itself lives in a ref - this avoids a re-render storm (one
 * setState per character at speed = perf disaster). Only the text
 * content triggers a render.
 *
 * Usage:
 *
 *   <h1>
 *     I'm a{" "}
 *     <TypewriterCycle
 *       roles={[
 *         "Backend Developer",
 *         "Automation Engineer",
 *         "API Designer",
 *       ]}
 *       speed={80}
 *       waitFrames={28}
 *     />
 *   </h1>
 *
 * Knobs:
 *   - speed: ms per character (lower = faster typing)
 *   - waitFrames: how many `setInterval` ticks to pause at the
 *     end of a fully-typed role before starting to delete
 *     (default 28 × 80ms ≈ 2.2s)
 *
 * Example pacing for the defaults:
 *   - "Backend Developer" → ~1.4s to type
 *   - 2.2s wait at the end
 *   - ~1.4s to delete
 *   - cycle to next role
 *   - total cycle: ~5s per role
 */

"use client";
import { useEffect, useRef, useState } from "react";

type Phase = "typing" | "waiting" | "deleting";

interface State {
  roleIndex: number;
  text: string;
  phase: Phase;
  waitCounter: number;
}

export default function TypewriterCycle({
  roles,
  speed = 80,
  waitFrames = 28,
  className = "",
}: {
  roles: string[];
  speed?: number;
  waitFrames?: number;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState("");
  const stateRef = useRef<State>({
    roleIndex: 0,
    text: "",
    phase: "typing",
    waitCounter: 0,
  });

  useEffect(() => {
    if (roles.length === 0) return;

    const interval = setInterval(() => {
      const s = stateRef.current;
      const role = roles[s.roleIndex];

      if (s.phase === "typing") {
        if (s.text.length < role.length) {
          // Add next character
          s.text = role.slice(0, s.text.length + 1);
          setDisplayText(s.text);
        } else {
          // Done typing - switch to wait phase
          s.phase = "waiting";
          s.waitCounter = 0;
        }
      } else if (s.phase === "waiting") {
        s.waitCounter++;
        if (s.waitCounter > waitFrames) {
          s.phase = "deleting";
        }
      } else if (s.phase === "deleting") {
        if (s.text.length > 0) {
          // Remove last character
          s.text = s.text.slice(0, -1);
          setDisplayText(s.text);
        } else {
          // Done deleting - advance role index, start typing again
          s.roleIndex = (s.roleIndex + 1) % roles.length;
          s.phase = "typing";
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [roles, speed, waitFrames]);

  return <span className={className}>{displayText}</span>;
}
