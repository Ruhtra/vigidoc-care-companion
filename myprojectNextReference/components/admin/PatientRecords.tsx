"use client";

// components/admin/PatientRecords.tsx
// Aba/componente de registros detalhados do paciente.
// Inclui filtros por período e severidade, timeline de registros,
// e placeholder para gráficos futuros.
// Projetado para ser embeddado dentro de PatientPage (tab "Registros").

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Weight,
  Frown,
  Calendar,
  BarChart3,
  Filter,
  Clock,
  AlertCircle,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import type { Patient, RecordSession, VitalValue, VitalStatus } from "@/types/patient";

/* ==========================================================================
   TYPES & CONSTANTS
   ========================================================================== */

type PeriodFilter = "7d" | "30d" | "90d" | "all";
type SeverityFilter = "all" | "critical" | "alert" | "warning";

const vitalIcons: Record<string, React.ElementType> = {
  FC: Heart,
  PA: Gauge,
  SpO2: Droplets,
  Temp: Thermometer,
  Peso: Weight,
  Dor: Frown,
};

const PERIOD_OPTIONS: { value: PeriodFilter; label: string; days: number | null }[] = [
  { value: "7d", label: "7 dias", days: 7 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "90d", label: "90 dias", days: 90 },
  { value: "all", label: "Todos", days: null },
];

const SEVERITY_OPTIONS: { value: SeverityFilter; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "Todos", icon: Filter },
  { value: "critical", label: "Críticos", icon: Activity },
  { value: "alert", label: "Alertas", icon: AlertCircle },
  { value: "warning", label: "Atenção", icon: AlertCircle },
];

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWorstStatus(record: RecordSession): VitalStatus {
  const vitals: VitalValue[] = [
    record.bloodPressure,
    record.heartRate,
    record.temperature,
    record.oxygenSaturation,
    record.weight,
    record.pain,
  ];
  if (vitals.some((v) => v.status === "critical")) return "critical";
  if (vitals.some((v) => v.status === "alert")) return "alert";
  if (vitals.some((v) => v.status === "warning")) return "warning";
  return "normal";
}

function isWithinPeriod(dateIso: string, days: number | null): boolean {
  if (days === null) return true;
  const recordDate = new Date(dateIso);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return recordDate >= cutoff;
}

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

/** Badge compacto de sinal vital */
function VitalBadge({ vital }: { vital: VitalValue }) {
  const Icon = vitalIcons[vital.label] ?? Activity;

  const colors = {
    critical:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    alert:
      "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    warning:
      "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    normal:
      "bg-muted/50 text-foreground border-border/50 dark:bg-muted/20",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-all",
        colors[vital.status],
      )}
    >
      <Icon size={12} className="opacity-70" />
      <span className="font-semibold">{vital.label}</span>
      <span className="font-bold">{vital.value}</span>
      <span className="opacity-50 text-[10px]">{vital.unit}</span>
    </div>
  );
}

/** Item da timeline de registros */
function RecordTimelineItem({
  record,
  index,
  isLast,
}: {
  record: RecordSession;
  index: number;
  isLast: boolean;
}) {
  const status = getWorstStatus(record);
  const vitals: VitalValue[] = [
    record.bloodPressure,
    record.heartRate,
    record.oxygenSaturation,
    record.temperature,
    record.weight,
    record.pain,
  ];

  const statusDotColor = {
    critical: "bg-red-500 shadow-red-500/30 shadow-sm",
    alert: "bg-orange-500 shadow-orange-500/30 shadow-sm",
    warning: "bg-yellow-500 shadow-yellow-500/30 shadow-sm",
    normal: "bg-emerald-500 shadow-emerald-500/30 shadow-sm",
  };

  const statusBorderColor = {
    critical: "border-l-red-400 dark:border-l-red-800",
    alert: "border-l-orange-400 dark:border-l-orange-800",
    warning: "border-l-yellow-400 dark:border-l-yellow-800",
    normal: "border-l-border",
  };

  return (
    <motion.div
      variants={fadeInUp}
      custom={index * 0.06}
      className="relative flex gap-4"
    >
      {/* Timeline vertical */}
      <div className="flex flex-col items-center shrink-0 w-6">
        <div
          className={cn(
            "h-3 w-3 rounded-full mt-2 z-10 ring-4 ring-background",
            statusDotColor[status],
          )}
        />
        {!isLast && <div className="flex-1 w-px bg-border/60 mt-1" />}
      </div>

      {/* Content card */}
      <Card
        className={cn(
          "flex-1 mb-4 overflow-hidden border-l-[3px] py-0",
          statusBorderColor[status],
        )}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Calendar size={12} className="text-muted-foreground" />
                {formatDateShort(record.date)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={10} />
                {formatTime(record.date)}
              </div>
            </div>
            {status !== "normal" && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold",
                  status === "critical"
                    ? "border-red-300 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                    : status === "alert"
                      ? "border-orange-300 text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                      : "border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                )}
              >
                {status === "critical" ? "Crítico" : status === "alert" ? "Alerta" : "Atenção"}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {vitals.map((vital, idx) => (
              <VitalBadge key={idx} vital={vital} />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/** Placeholder para gráficos futuros */
function ChartPlaceholder() {
  return (
    <Card className="overflow-hidden border-dashed">
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[180px]">
        <div className="relative mb-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BarChart3 size={24} className="text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-teal-500/20 flex items-center justify-center">
            <TrendingUp size={10} className="text-teal-600 dark:text-teal-400" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          Gráficos de Evolução
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Em breve você poderá visualizar gráficos interativos de evolução dos
          sinais vitais ao longo do tempo.
        </p>
        {/* Mini chart decorativo */}
        <div className="flex items-end gap-1 mt-4 opacity-30">
          {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
            <div
              key={i}
              className="w-3 rounded-t-sm bg-primary/40"
              style={{ height: `${h * 0.4}px` }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ==========================================================================
   MAIN COMPONENT: PatientRecords
   ========================================================================== */

interface PatientRecordsProps {
  /** Paciente já carregado — recebido do componente pai (PatientPage) */
  patient: Patient;
}

export default function PatientRecords({ patient }: PatientRecordsProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30d");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  // Combina lastRecord + dailyHistory e aplica filtros
  const filteredRecords = useMemo(() => {
    const allRecords = [patient.lastRecord, ...patient.dailyHistory];
    const periodOption = PERIOD_OPTIONS.find((p) => p.value === periodFilter);
    const days = periodOption?.days ?? null;

    return allRecords.filter((record) => {
      const withinPeriod = isWithinPeriod(record.date, days);
      const matchesSeverity =
        severityFilter === "all" || getWorstStatus(record) === severityFilter;
      return withinPeriod && matchesSeverity;
    });
  }, [patient, periodFilter, severityFilter]);

  // Contadores para badges nos filtros de severidade
  const severityCounts = useMemo(() => {
    const allRecords = [patient.lastRecord, ...patient.dailyHistory];
    const periodOption = PERIOD_OPTIONS.find((p) => p.value === periodFilter);
    const days = periodOption?.days ?? null;
    const periodFiltered = allRecords.filter((r) => isWithinPeriod(r.date, days));

    return {
      all: periodFiltered.length,
      critical: periodFiltered.filter((r) => getWorstStatus(r) === "critical").length,
      alert: periodFiltered.filter((r) => getWorstStatus(r) === "alert").length,
      warning: periodFiltered.filter((r) => getWorstStatus(r) === "warning").length,
    };
  }, [patient, periodFilter]);

  return (
    <div className="space-y-5">
      {/* ── FILTERS ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-card p-3 rounded-xl border border-border shadow-sm">
        {/* Period filters */}
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-muted-foreground shrink-0" />
          <div className="flex gap-1.5">
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={periodFilter === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriodFilter(option.value)}
                className={cn(
                  "h-8 px-3 text-xs whitespace-nowrap",
                  periodFilter === option.value
                    ? ""
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <Separator orientation="vertical" className="hidden sm:block h-6" />

        {/* Severity filters */}
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <div className="flex gap-1.5">
            {SEVERITY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const count = severityCounts[option.value];

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={
                    severityFilter === option.value
                      ? option.value === "critical"
                        ? "destructive"
                        : option.value === "alert" || option.value === "warning"
                          ? "secondary"
                          : "default"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() => setSeverityFilter(option.value)}
                  className={cn(
                    "h-8 px-3 text-xs whitespace-nowrap gap-1.5",
                    severityFilter === option.value
                      ? option.value === "alert"
                        ? "bg-orange-100/80 text-orange-800 hover:bg-orange-200/80 dark:bg-orange-900/40 dark:text-orange-200"
                        : option.value === "warning"
                          ? "bg-yellow-100/80 text-yellow-800 hover:bg-yellow-200/80 dark:bg-yellow-900/40 dark:text-yellow-200"
                          : ""
                      : option.value === "critical"
                        ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        : option.value === "alert"
                          ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          : option.value === "warning"
                            ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={14} />
                  {option.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0 rounded-full ml-0.5",
                        severityFilter === option.value
                          ? "bg-current/10"
                          : "bg-muted dark:bg-muted/50",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CHART PLACEHOLDER ── */}
      <ChartPlaceholder />

      {/* ── RECORDS TIMELINE ── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
          <Clock size={14} />
          Registros
          <span className="text-xs font-normal normal-case tracking-normal ml-1 opacity-70">
            ({filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""})
          </span>
        </h2>

        <AnimatePresence mode="wait">
          {filteredRecords.length > 0 ? (
            <motion.div
              key={`${periodFilter}-${severityFilter}`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {filteredRecords.map((record, idx) => (
                <RecordTimelineItem
                  key={`${record.date}-${idx}`}
                  record={record}
                  index={idx}
                  isLast={idx === filteredRecords.length - 1}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-dashed">
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Filter size={20} className="text-muted-foreground/50" />
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-1">
                    Nenhum registro encontrado
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Tente ajustar os filtros de período ou severidade para ver
                    mais registros.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setPeriodFilter("all");
                      setSeverityFilter("all");
                    }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
