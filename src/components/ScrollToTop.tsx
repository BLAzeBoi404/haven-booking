"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      onClick={toTop}
      aria-label="Нагору"
      className={cn(
        "fixed bottom-5 right-5 z-[400] w-11 h-11 rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center transition-all duration-200 hover:bg-emerald-600 hover:scale-105",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none",
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
