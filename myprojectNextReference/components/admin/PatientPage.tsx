"use client";

// components/admin/PatientPage.tsx
// Página completa do paciente com tabs extensíveis.
// Tab "Resumo" — dados pessoais, clínicos, último registro.
// Tab "Registros" — filtros, timeline, placeholder de gráficos.

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Weight,
  Frown,
  Calendar,
  Phone,
  Stethoscope,
  FileBarChart,
  User,
  ClipboardList,
  Gauge,
  ArrowLeft,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatientById } from "@/hooks/usePatientById";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import PatientRecords from "@/components/admin/PatientRecords";
import type { Patient, VitalValue, VitalStatus } from "@/types/patient";

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const vitalIcons: Record<string, React.ElementType> = {
  FC: Heart,
  PA: Gauge,
  SpO2: Droplets,
  Temp: Thermometer,
  Peso: Weight,
  Dor: Frown,
};

const ECOG_LABELS: Record<number, string> = {
  0: "Assintomático",
  1: "Sintomático ambulatório",
  2: "Acamado < 50% do dia",
  3: "Acamado > 50% do dia",
  4: "Completamente acamado",
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWorstStatus(vitals: VitalValue[]): VitalStatus {
  if (vitals.some((v) => v.status === "critical")) return "critical";
  if (vitals.some((v) => v.status === "alert")) return "alert";
  if (vitals.some((v) => v.status === "warning")) return "warning";
  return "normal";
}

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

/** Linha de informação com ícone */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

/** Card de sinal vital */
function VitalCard({ vital }: { vital: VitalValue }) {
  const Icon = vitalIcons[vital.label] ?? Activity;

  const statusStyles = {
    critical:
      "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
    alert:
      "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
    normal:
      "bg-muted/40 border-border/50 text-foreground dark:bg-muted/15",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border p-3 transition-all",
        statusStyles[vital.status],
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={14} className="opacity-70" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {vital.label}
        </span>
      </div>
      <div className="text-xl font-bold leading-none">
        {vital.value}
        <span className="text-xs font-normal ml-0.5 opacity-60">
          {vital.unit}
        </span>
      </div>
    </div>
  );
}

/** Skeleton para loading */
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-52 rounded bg-muted" />
          <div className="h-4 w-36 rounded bg-muted" />
        </div>
      </div>
      <div className="h-10 w-64 rounded-lg bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-56 rounded-xl bg-muted" />
        <div className="h-56 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB: Resumo
   ========================================================================== */

function TabResumo({ patient }: { patient: Patient }) {
  const vitals: VitalValue[] = [
    patient.lastRecord.bloodPressure,
    patient.lastRecord.heartRate,
    patient.lastRecord.oxygenSaturation,
    patient.lastRecord.temperature,
    patient.lastRecord.weight,
    patient.lastRecord.pain,
  ];

  const ecogColors: Record<number, string> = {
    0: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    1: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    3: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    4: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Layout em duas colunas (desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* DADOS PESSOAIS */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden">
            <div className="p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <User size={12} />
                Dados Pessoais
              </h3>
              <div className="space-y-0.5">
                <InfoRow
                  icon={Calendar}
                  label="Data de Nascimento"
                  value={formatDate(patient.dateOfBirth)}
                />
                <InfoRow
                  icon={Phone}
                  label="Telefone"
                  value={patient.phone}
                />
                <InfoRow
                  icon={Clock}
                  label="Data de Admissão"
                  value={formatDate(patient.admissionDate)}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* DADOS CLÍNICOS */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden">
            <div className="p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <Stethoscope size={12} />
                Dados Clínicos
              </h3>
              <div className="space-y-0.5">
                <InfoRow
                  icon={ClipboardList}
                  label="Tipo de Doença"
                  value={patient.diseaseType}
                />
                <InfoRow
                  icon={FileBarChart}
                  label="CID-10"
                  value={
                    <span className="font-mono text-primary font-semibold">
                      {patient.cid}
                    </span>
                  }
                />
                {/* ECOG com badge colorido */}
                <div className="flex items-center gap-3 py-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      ECOG
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        className={cn(
                          "text-xs font-bold px-2 py-0",
                          ecogColors[patient.ecog],
                        )}
                      >
                        {patient.ecog}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ECOG_LABELS[patient.ecog]}
                      </span>
                    </div>
                  </div>
                </div>
                <InfoRow
                  icon={Stethoscope}
                  label="Diagnóstico"
                  value={patient.diagnosis}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ÚLTIMO REGISTRO */}
      <motion.div variants={fadeInUp}>
        <Card className="overflow-hidden">
          <div className="p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
              <Heart size={12} />
              Último Registro
              <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-70 flex items-center gap-1">
                <Clock size={10} />
                {formatDate(patient.lastRecord.date)} às{" "}
                {formatTime(patient.lastRecord.date)}
              </span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {vitals.map((vital, idx) => (
                <VitalCard key={idx} vital={vital} />
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================================
   MAIN COMPONENT: PatientPage
   ========================================================================== */

interface PatientPageProps {
  patientId: string;
}

export default function PatientPage({ patientId }: PatientPageProps) {
  const { data: patient, isLoading, isError, error, refetch } =
    usePatientById(patientId);

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-500">
        <PageSkeleton />
      </div>
    );
  }

  /* ── ERROR / NOT FOUND ── */
  if (isError || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-lg font-medium text-foreground">
          {isError ? "Erro ao carregar paciente" : "Paciente não encontrado"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mb-4">
          {error instanceof Error
            ? error.message
            : "Não foi possível localizar este paciente."}
        </p>
        <div className="flex gap-3">
          <Link href="/patients">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} />
              Voltar
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  /* ── ECOG color for header badge ── */
  const ecogColors: Record<number, string> = {
    0: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    1: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    3: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    4: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── BACK BUTTON ── */}
      <Link href="/patients">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft size={16} />
          Voltar para Pacientes
        </Button>
      </Link>

      {/* ── PATIENT HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-16 w-16 rounded-2xl border-2 border-primary/20 bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xl font-bold text-primary">
              {getInitials(patient.name)}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight truncate">
              {patient.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground mt-0.5">
              <span>{patient.age} anos</span>
              <span className="text-border">•</span>
              <span>{patient.phone}</span>
            </div>
          </div>
        </div>

        {/* Clinical badges */}
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Badge
            variant="outline"
            className="text-xs font-semibold border-primary/30 text-primary bg-primary/5"
          >
            <Stethoscope size={12} className="mr-1" />
            {patient.diseaseType}
          </Badge>
          <Badge variant="outline" className="text-xs font-mono border-border">
            CID: {patient.cid}
          </Badge>
          <Badge className={cn("text-xs font-bold", ecogColors[patient.ecog])}>
            ECOG {patient.ecog}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* ── TABS ── */}
      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-11">
          <TabsTrigger
            value="resumo"
            className="gap-1.5 text-sm data-[state=active]:shadow-sm"
          >
            <User size={14} />
            Resumo
          </TabsTrigger>
          <TabsTrigger
            value="registros"
            className="gap-1.5 text-sm data-[state=active]:shadow-sm"
          >
            <ClipboardList size={14} />
            Registros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-5">
          <TabResumo patient={patient} />
        </TabsContent>

        <TabsContent value="registros" className="mt-5">
          <PatientRecords patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
