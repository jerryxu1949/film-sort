import { useEffect, useRef } from "react";

/**
 * Modern hero backdrop: layered animated mesh-gradient blobs + mouse spotlight.
 * All styling lives in CSS tokens; this component only owns the pointer rAF loop.
 * Purely decorative (`aria-hidden`), so a failure here must never break the page.
 */
export function HeroBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const spot = root.querySelector<HTMLElement>(".md-spot");
    if (!spot) return;

    // 起始位置放在右肩，避免首帧光斑从 (0,0) 飞过来
    let tx = 0.72;
    let ty = 0.32;
    let cx = tx;
    let cy = ty;
    let raf = 0;
    let disposed = false;

    const apply = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      const dx = (cx - 0.5) * 30;
      const dy = (cy - 0.5) * 30;
      spot.style.setProperty("--md-mx", `${(cx * 100).toFixed(2)}%`);
      spot.style.setProperty("--md-my", `${(cy * 100).toFixed(2)}%`);
      spot.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(apply);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      tx = (e.clientX - rect.left) / rect.width;
      ty = (e.clientY - rect.top) / rect.height;
    };

    const onPointerLeave = () => {
      // 离开 hero 后光斑缓缓回到右肩
      tx = 0.72;
      ty = 0.32;
    };

    apply();
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      spot.style.removeProperty("--md-mx");
      spot.style.removeProperty("--md-my");
      spot.style.transform = "";
    };
  }, []);

  return (
    <div className="md-backdrop" aria-hidden="true" ref={rootRef}>
      <div className="md-blob md-blob-a" />
      <div className="md-blob md-blob-b" />
      <div className="md-blob md-blob-c" />
      <div className="md-spot" />
      <div className="md-grain" />
    </div>
  );
}
