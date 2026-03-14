"use client";

// app/patients/[id]/records/page.tsx
// Página dedicada para visualização de registros do paciente.
// Renderiza PatientRecords com providers necessários.

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ThemeProvider,
  NavigationProvider,
} from "@/lib/contexts";
import { QueryProvider } from "@/lib/query-provider";
import Navbar from "@/components/Navbar";
import PatientRecords from "@/components/admin/PatientRecords";
import { usePatientById } from "@/hooks/usePatientById";
import { cn } from "@/lib/utils";

export default function PatientRecordsPage() {
  const params = useParams<{ id: string }>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <QueryProvider>
      <ThemeProvider>
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
              <PatientRecordsWrapper patientId={params.id} />
            </div>
          </main>
        </NavigationProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

function PatientRecordsWrapper({ patientId }: { patientId: string }) {
  const { data: patient, isLoading, isError } = usePatientById(patientId);

  if (isLoading) return <div>Carregando registros...</div>;
  if (isError || !patient) return <div>Paciente não encontrado.</div>;

  return <PatientRecords patient={patient} />;
}
