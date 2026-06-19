// =====================================================================
//  Примітиви UI — атомарні компоненти (Stars, Avatar, Chip, Toast, Spinner).
//  Перенесено з App.jsx, адаптовано під TypeScript + cn().
// =====================================================================

import { memo } from "react";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { CAT_CHIP } from "@/lib/currency";

export const Stars = memo(function Stars({ rating, sm }: { rating: number; sm?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(sm ? "w-3 h-3" : "w-4 h-4", i <= Math.round(Number(rating)) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")}
        />
      ))}
    </span>
  );
});

export const Avatar = memo(function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sz = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-3xl",
  }[size];
  return (
    <div className={cn(sz, "rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-semibold text-emerald-900 flex-shrink-0", className)}>
      {initials(name)}
    </div>
  );
});

export function Chip({ cat, className = "", onClick }: { cat: string; className?: string; onClick?: () => void }) {
  return (
    <span onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} className={cn("inline-block text-xs font-medium px-2 py-0.5 rounded-full border", CAT_CHIP[cat] || "bg-gray-50 text-gray-600 border-gray-200", onClick && "cursor-pointer", className)}>
      {cat}
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <div className={cn("w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin", className)} />;
}

export function Toast({ msg, type = "success", onDone }: { msg: string; type?: "success" | "error"; onDone: () => void }) {
  // авто-закриття через 2.6с
  if (typeof window !== "undefined") {
    setTimeout(onDone, 2600);
  }
  return (
    <div className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-[900]", type === "error" ? "bg-rose-600" : "bg-emerald-700", "text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap pop-in")}>
      {type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  );
}
