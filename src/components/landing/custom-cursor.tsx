"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springX = useSpring(mouseX, { stiffness: 500, damping: 35, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 35, mass: 0.4 });

  useEffect(() => {
    const isFinePointer =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer) return;

    setEnabled(true);
    document.documentElement.classList.add("cursor-none");

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const interactive = t.closest(
        'a,button,[role="button"],input,select,textarea,label,[data-cursor="hover"]'
      );
      setHovering(Boolean(interactive));
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("cursor-none");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Core dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed z-[9999] top-0 left-0"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      >
        <motion.div
          animate={{
            width: hovering ? 40 : 12,
            height: hovering ? 40 : 12,
            backgroundColor: hovering ? "rgba(34,197,94,0.15)" : "#22c55e",
            borderColor: hovering ? "rgba(34,197,94,0.6)" : "rgba(34,197,94,0)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="rounded-full border mix-blend-screen shadow-[0_0_20px_rgba(34,197,94,0.4)]"
        />
      </motion.div>
    </>
  );
}
