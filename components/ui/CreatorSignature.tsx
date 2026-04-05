"use client";

import { useEffect } from "react";

export default function CreatorSignature() {
  useEffect(() => {
    console.info(
      "%cBuilt by Talha",
      "color:#0f766e; font-weight:700; letter-spacing:0.08em;",
    );
  }, []);

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none fixed bottom-2 right-2 z-50 select-none text-[10px] font-medium tracking-[0.2em] text-slate-600/40 opacity-20 transition-opacity duration-500 hover:opacity-70"
    >
      Built by Talha
    </span>
  );
}
