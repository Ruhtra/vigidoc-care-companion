"use client";

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "@/hooks/useTheme";

/* ==========================================================================
   THEME CONTEXT
   Wraps the existing useTheme hook so the entire component tree can access
   theme state without prop drilling.
   ========================================================================== */

interface ThemeContextValue {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = useTheme();
  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return ctx;
}

/* ==========================================================================
   NAVIGATION CONTEXT
   Manages which page/view is currently active so the Navbar and content area
   can stay in sync.
   ========================================================================== */

interface NavigationContextValue {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined,
);

export function NavigationProvider({
  children,
  defaultPage = "dashboard",
}: {
  children: ReactNode;
  defaultPage?: string;
}) {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  return (
    <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return ctx;
}
