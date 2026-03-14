"use client";

// components/admin/PatientDialog.tsx
// Dialog compacto de visão rápida do paciente.
// Exibe dados essenciais sem scroll, com botão para a página completa.

import React from "react";
import Link from "next/link";
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Weight,
  Frown,
  Gauge,
  Stethoscope,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  2: "Acamado < 50%",
  3: "Acamado > 50%",
  4: "Acamado total",
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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) return "Hoje";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function getWorstStatus(vitals: VitalValue[]): VitalStatus {
  if (vitals.some((v) => v.status === "critical")) return "critical";
  if (vitals.some((v) => v.status === "alert")) return "alert";
  if (vitals.some((v) => v.status === "warning")) return "warning";
  return "normal";
}

/* ==========================================================================
   SUB-COMPONENT: Sinal vital compacto
   ========================================================================== */

function VitalMini({ vital }: { vital: VitalValue }) {
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
        "flex flex-col items-center justify-center rounded-lg border p-2 transition-all",
        statusStyles[vital.status],
      )}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className="opacity-70" />
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {vital.label}
        </span>
      </div>
      <div className="text-sm font-bold leading-none">
        {vital.value}
        <span className="text-[9px] font-normal ml-0.5 opacity-60">
          {vital.unit}
        </span>
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN COMPONENT: PatientDialog
   ========================================================================== */

interface PatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PatientDialog({
  patient,
  open,
  onOpenChange,
}: PatientDialogProps) {
  if (!patient) return null;

  const vitals: VitalValue[] = [
    patient.lastRecord.bloodPressure,
    patient.lastRecord.heartRate,
    patient.lastRecord.oxygenSaturation,
    patient.lastRecord.temperature,
    patient.lastRecord.weight,
    patient.lastRecord.pain,
  ];

  const worstStatus = getWorstStatus(vitals);

  const ecogColors: Record<number, string> = {
    0: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    1: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    3: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    4: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* ── HEADER ── */}
        <DialogHeader className="px-5 pt-5 pb-4 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-3.5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-14 w-14 rounded-2xl border-2 border-primary/20 bg-primary/10 flex items-center justify-center shadow-sm">
                <span className="text-base font-bold text-primary">
                  {getInitials(patient.name)}
                </span>
              </div>
              {/* Status dot */}
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                  worstStatus === "critical"
                    ? "bg-red-500 animate-pulse"
                    : worstStatus === "alert"
                      ? "bg-orange-500"
                      : worstStatus === "warning"
                        ? "bg-yellow-500"
                        : "bg-emerald-500",
                )}
              />
            </div>

            {/* Name + info */}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-bold text-foreground leading-tight truncate">
                {patient.name}
              </DialogTitle>
              <DialogDescription className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span>{patient.age} anos</span>
                <span className="text-border">•</span>
                <span>{patient.phone}</span>
              </DialogDescription>

              {/* Clinical badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold border-primary/30 text-primary bg-primary/5 px-2 py-0"
                >
                  <Stethoscope size={10} className="mr-1" />
                  {patient.diseaseType}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-border px-2 py-0"
                >
                  CID: {patient.cid}
                </Badge>
                <Badge
                  className={cn(
                    "text-[10px] font-bold px-2 py-0",
                    ecogColors[patient.ecog],
                  )}
                >
                  ECOG {patient.ecog}
                  <span className="ml-1 font-normal opacity-80 hidden sm:inline">
                    — {ECOG_LABELS[patient.ecog]}
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── SINAIS VITAIS ── */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Heart size={10} />
              Último Registro
            </h3>
            <span className="text-[10px] text-muted-foreground/70 ml-auto flex items-center gap-1">
              <Clock size={9} />
              {formatDateShort(patient.lastRecord.date)},{" "}
              {formatTime(patient.lastRecord.date)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {vitals.map((vital, idx) => (
              <VitalMini key={idx} vital={vital} />
            ))}
          </div>
        </div>

        {/* ── FOOTER COM CTA ── */}
        <DialogFooter className="sm:justify-center">
          <Link
            href={`/patients/${patient.id}`}
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            <Button className="w-full gap-2 font-semibold" size="lg">
              Ver Dados Completos
              <ExternalLink size={16} />
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
