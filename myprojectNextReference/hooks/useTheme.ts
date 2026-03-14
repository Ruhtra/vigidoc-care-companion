"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Shared theme hook for VigiDoc.
 * Reads/writes to localStorage key "vigidoc-theme" and toggles the `dark` class
 * on `<html>`. Works with the inline <script> in layout.tsx that prevents FOUC.
 */
export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("vigidoc-theme") as
      | "light"
      | "dark"
      | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("vigidoc-theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
