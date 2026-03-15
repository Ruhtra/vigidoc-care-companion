"use client";

import { useState } from "react";
import {
  ThemeProvider,
  NavigationProvider,
} from "@/lib/contexts";
import { QueryProvider } from "@/lib/query-provider";
import Navbar from "@/components/Navbar";
import PatientList from "@/components/admin/PatientList";
import { cn } from "@/lib/utils";

export default function PatientsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <QueryProvider>
      <ThemeProvider>
        {/* We keep NavigationProvider to ensure context is available for Navbar, 
            and we set defaultPage to patients so the Navbar highlights it automatically */}
        <NavigationProvider defaultPage="patients">
          <Navbar
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <main
            className={cn(
              "min-h-screen",
              "pt-16 lg:pt-20",
              "pb-20 lg:pb-6",
              "px-4 sm:px-6 lg:px-8",
            )}
          >
            <div className="mx-auto max-w-6xl py-6">
              <PatientList />
            </div>
          </main>
        </NavigationProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
