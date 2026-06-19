"use client";

import { useEffect, useState } from "react";

/** Дебаунс значення (для пошукового вводу). */
export function useDebounce<T>(val: T, ms: number): T {
  const [v, setV] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setV(val), ms);
    return () => clearTimeout(t);
  }, [val, ms]);
  return v;
}
