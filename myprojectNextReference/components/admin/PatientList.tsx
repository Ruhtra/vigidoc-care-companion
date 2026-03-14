"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import PatientDialog from "@/components/admin/PatientDialog";
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Cookie,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  AlertCircle,
  RefreshCw,
  Users,
  Clock,
  Calendar,
  Gauge,
  Weight,
  Frown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/usePatients";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import type {
  Patient,
  RecordSession,
  VitalValue,
  VitalStatus,
} from "@/types/patient";

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

type FilterType = "all" | "critical" | "alert" | "warning";

/* ==========================================================================
   HELPER FUNCTIONS
   ========================================================================== */

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

/**
 * Scalable Search Rule: Matches name or digits in phone
 * Added: Accent insulation (normalized search)
 */
function matchesSearch(patient: Patient, term: string): boolean {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return true;

  const normalizedName = normalize(patient.name);
  const nameMatch = normalizedName.includes(normalizedTerm);

  const digits = normalizedTerm.replace(/\D/g, "");
  const phoneMatch =
    digits.length > 0 && patient.phone.replace(/\D/g, "").includes(digits);

  return nameMatch || phoneMatch;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDateToDay(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) return "Hoje";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ==========================================================================
   SUB-COMPONENTS: Vitals
   ========================================================================== */

function VitalDisplay({ vital }: { vital: VitalValue }) {
  const Icon = vitalIcons[vital.label] ?? Activity;

  const statusColors = {
    critical:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    alert:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
    warning:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    normal:
      "bg-muted/30 text-muted-foreground border-border/50 dark:bg-muted/10 dark:text-muted-foreground dark:border-border/50",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-1.5 px-1 rounded-md border transition-all h-full min-w-[55px]",
        statusColors[vital.status],
      )}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className="opacity-70" />
        <span className="hidden min-[450px]:inline text-[9px] font-bold uppercase tracking-wider">
          {vital.label}
        </span>
      </div>
      <div className="text-xs font-bold leading-none whitespace-nowrap">
        {vital.value}
        <span className="text-[8px] font-normal ml-0.5 opacity-70">
          {vital.unit}
        </span>
      </div>
    </div>
  );
}

function VitalBadgeSmall({ vital }: { vital: VitalValue }) {
  const Icon = vitalIcons[vital.label] ?? Activity;

  const colors = {
    critical:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    alert:
      "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    warning:
      "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    normal: "bg-muted/50 text-foreground border-border/50 dark:bg-muted/20",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]",
        colors[vital.status],
      )}
    >
      <Icon size={10} />
      <span className="font-semibold">{vital.label}:</span>
      <span className="font-bold">{vital.value}</span>
      <span className="opacity-70 ml-0.5">{vital.unit}</span>
    </div>
  );
}

/* ==========================================================================
   SUB-COMPONENT: PatientCard
   ========================================================================== */

function PatientCard({
  patient,
  index,
  onOpenSheet,
}: {
  patient: Patient;
  index: number;
  onOpenSheet: (patient: Patient) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const worstStatus = getWorstStatus(patient.lastRecord);
  const hasHistory = patient.dailyHistory.length > 0;

  const vitals: VitalValue[] = [
    patient.lastRecord.bloodPressure,
    patient.lastRecord.heartRate,
    patient.lastRecord.temperature,
    patient.lastRecord.oxygenSaturation,
    patient.lastRecord.weight,
    patient.lastRecord.pain,
  ];

  return (
    <motion.div variants={fadeInUp} custom={index * 0.08}>
      <Card className="overflow-hidden border-border transition-all hover:shadow-md dark:hover:shadow-primary/5 py-0 gap-0  ">
        {/* HEADER: Layout Grid/Flex */}
        <div className="p-2.5 lg:p-3 bg-card flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
          {/* 1. Patient Info (Left, Fixed Width on Desktop) */}
          <div className="flex items-center gap-3 lg:w-[280px] shrink-0">
            <div className="relative shrink-0">
              <div className="h-12 w-12 rounded-full border-2 border-muted bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {getInitials(patient.name)}
                </span>
              </div>
              <div
                className={cn(
                  "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card",
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

            <div className="min-w-0">
              <h3 className="font-bold text-base text-foreground leading-tight truncate">
                {patient.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                <span>{patient.age} anos</span>
                <span className="text-border">•</span>
                <span className="truncate">{patient.phone}</span>
              </div>
            </div>
          </div>

          {/* 2. Latest Record (Middle, Flexible Grid) */}
          <div className="flex-1 bg-muted/30 dark:bg-muted/10 rounded-lg p-2 border border-border/50">
            {/* Mobile Label */}
            <div className="lg:hidden flex items-center gap-1 mb-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              <Clock size={10} /> {formatDateToDay(patient.lastRecord.date)},{" "}
              {formatTime(patient.lastRecord.date)}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {vitals.map((vital, idx) => (
                <VitalDisplay key={idx} vital={vital} />
              ))}
            </div>
          </div>

          {/* 3. Actions (Right, Aligned) */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 lg:w-[140px] shrink-0">
            {/* Desktop Timestamp */}
            <div className="hidden lg:flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-medium mb-1 w-full">
              <Clock size={10} /> {formatDateToDay(patient.lastRecord.date)},{" "}
              {formatTime(patient.lastRecord.date)}
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <Button
                size="sm"
                className="h-8 text-xs px-3 shadow-sm flex-1 lg:flex-none"
                onClick={() => onOpenSheet(patient)}
              >
                <FileText size={14} className="mr-1.5" />
                Prontuário
              </Button>

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => hasHistory && setExpanded(!expanded)}
                disabled={!hasHistory}
                className={cn(
                  "h-8 w-8 shrink-0 transition-opacity",
                  !hasHistory
                    ? "invisible pointer-events-none"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
          </div>
        </div>

        {/* EXPANDED HISTORY */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,border-width] duration-300 ease-out bg-muted/20",
            expanded
              ? "grid-rows-[1fr] border-t border-border"
              : "grid-rows-[0fr] border-t-0 border-transparent",
          )}
        >
          <div className="overflow-hidden">
            <div className="p-3 pl-8 md:pl-20 relative">
              <div className="absolute left-6 md:left-[4.5rem] top-3 bottom-4 w-px bg-border/50 border-l border-dashed border-border"></div>

              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar size={10} /> Outros registros históricos
              </h4>

              <div className="space-y-3 pb-2">
                {patient.dailyHistory.map((record, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <div className="z-10 bg-card border border-border text-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm w-fit">
                      {formatDateToDay(record.date)} {formatTime(record.date)}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <VitalBadgeSmall vital={record.bloodPressure} />
                      <VitalBadgeSmall vital={record.heartRate} />
                      <VitalBadgeSmall vital={record.temperature} />
                      <VitalBadgeSmall vital={record.oxygenSaturation} />
                      <VitalBadgeSmall vital={record.weight} />
                      <VitalBadgeSmall vital={record.pain} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ==========================================================================
   SUB-COMPONENT: PatientListSkeleton (loading state)
   ========================================================================== */

function PatientListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-2.5 lg:p-3 bg-card flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 animate-pulse">
            <div className="flex items-center gap-3 lg:w-[280px] shrink-0">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 flex-1">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-[52px] rounded-lg bg-muted" />
              ))}
            </div>

            <div className="flex lg:flex-col items-center gap-2 lg:min-w-[140px] shrink-0">
              <div className="h-8 w-24 rounded-md bg-muted" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ==========================================================================
   SUB-COMPONENT: PatientListError (error state)
   ========================================================================== */

function PatientListError({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-lg font-medium text-foreground">
        Erro ao carregar pacientes
      </h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mb-4">
        {error?.message ?? "Ocorreu um erro inesperado."}
      </p>
      <Button variant="outline" className="gap-2" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

/* ==========================================================================
   MAIN COMPONENT: PatientList
   ========================================================================== */
export default function PatientList() {
  const { data, isLoading, isError, error, refetch } = usePatients();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  // Estado do Sheet de prontuário
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleOpenSheet = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setSheetOpen(true);
  }, []);

  // Handlers memoizados
  const handleFilterClick = useCallback((type: FilterType) => {
    setFilterType(type);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setFilterType("all");
  }, []);

  // Filtro principal
  const filteredPatients = useMemo(() => {
    const list = data || [];
    console.log("Recalculando filteredPatients. filterType:", filterType); // Debug
    return list.filter((patient) => {
      const isSearchMatch = matchesSearch(patient, searchTerm);
      const isTypeMatch =
        filterType === "all" ||
        getWorstStatus(patient.lastRecord) === filterType;
      return isSearchMatch && isTypeMatch;
    });
  }, [data, searchTerm, filterType]);

  // Estatísticas (baseadas na busca atual)
  const counts = useMemo(() => {
    const list = data || [];
    const searchedList = list.filter((p) => matchesSearch(p, searchTerm));
    return {
      all: searchedList.length,
      critical: searchedList.filter(
        (p) => getWorstStatus(p.lastRecord) === "critical",
      ).length,
      alert: searchedList.filter(
        (p) => getWorstStatus(p.lastRecord) === "alert",
      ).length,
      warning: searchedList.filter(
        (p) => getWorstStatus(p.lastRecord) === "warning",
      ).length,
    };
  }, [data, searchTerm]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="text-primary h-6 w-6" />
          Gestão de Pacientes
        </h1>
        <p className="text-muted-foreground text-sm">
          Localize prontuários e visualize o estado clínico em tempo real.
        </p>
      </div>

      {/* SEARCH & FILTERS (Sticky on mobile/desktop) */}
      {/* Barra de busca e filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-3 rounded-xl border border-border shadow-sm sticky top-16 lg:top-20 z-30">
        {/* Search input (já estava ok) */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            className="pl-9 h-[42px] bg-muted/50 border-border focus-visible:ring-primary"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Botões de filtro com type="button" */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Button
            type="button"
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => handleFilterClick("all")}
            className="h-[42px] px-3 sm:px-4 whitespace-nowrap"
          >
            <span className="hidden min-[450px]:inline">Todos</span>
            <Users
              size={16}
              className="min-[450px]:hidden text-current opacity-70"
            />
            {!isLoading && (
              <span
                className={cn(
                  "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
                  filterType === "all"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {counts.all}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant={filterType === "critical" ? "destructive" : "outline"}
            onClick={() => handleFilterClick("critical")}
            className={cn(
              "h-[42px] px-4 gap-2 whitespace-nowrap",
              filterType !== "critical" &&
                "text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20",
            )}
          >
            <Activity size={16} />
            <span className="hidden min-[450px]:inline">Críticos</span>
            {!isLoading && (
              <span
                className={cn(
                  "ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full",
                  filterType === "critical"
                    ? "bg-destructive-foreground/20 text-destructive-foreground"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                )}
              >
                {counts.critical}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant={filterType === "alert" ? "secondary" : "outline"}
            onClick={() => handleFilterClick("alert")}
            className={cn(
              "h-[42px] px-4 gap-2 whitespace-nowrap border-transparent w-auto",
              filterType === "alert"
                ? "bg-orange-100/80 text-orange-800 hover:bg-orange-200/80 dark:bg-orange-900/40 dark:text-orange-200"
                : "text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-900/50 dark:hover:bg-orange-900/20",
            )}
          >
            <AlertCircle size={16} />
            <span className="hidden min-[450px]:inline">Alertas</span>
            {!isLoading && (
              <span
                className={cn(
                  "ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full",
                  filterType === "alert"
                    ? "bg-orange-800/10 text-orange-800 dark:bg-orange-100/10 dark:text-orange-200"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
                )}
              >
                {counts.alert}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant={filterType === "warning" ? "secondary" : "outline"}
            onClick={() => handleFilterClick("warning")}
            className={cn(
              "h-[42px] px-4 gap-2 whitespace-nowrap border-transparent w-auto",
              filterType === "warning"
                ? "bg-yellow-100/80 text-yellow-800 hover:bg-yellow-200/80 dark:bg-yellow-900/40 dark:text-yellow-200"
                : "text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-900/50 dark:hover:bg-yellow-900/20",
            )}
          >
            <AlertCircle size={16} />
            <span className="hidden min-[450px]:inline">Atenção</span>
            {!isLoading && (
              <span
                className={cn(
                  "ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full",
                  filterType === "warning"
                    ? "bg-yellow-800/10 text-yellow-800 dark:bg-yellow-100/10 dark:text-yellow-200"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
                )}
              >
                {counts.warning}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {isLoading ? (
          <PatientListSkeleton />
        ) : isError ? (
          <PatientListError
            error={error instanceof Error ? error : null}
            onRetry={() => refetch()}
          />
        ) : filteredPatients.length > 0 ? (
          <motion.div
            key={filteredPatients.map((p) => p.id).join("-")} // chave única baseada nos IDs
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredPatients.map((patient, index) => (
              <PatientCard key={patient.id} patient={patient} index={index} onOpenSheet={handleOpenSheet} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Nenhum paciente encontrado
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {searchTerm || filterType !== "all"
                ? "Tente ajustar os filtros ou busque por outro nome/telefone."
                : "Nenhum paciente cadastrado no sistema."}
            </p>
            {(searchTerm || filterType !== "all") && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Limpar todos os filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dialog de visão rápida */}
      <PatientDialog
        patient={selectedPatient}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
