import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { getVitalStatus } from "../utils/vitals";
import type { VitalStatus } from "../types/patient";

export interface VitalRecord {
  id: string;
  user_id: string;
  recorded_at: string;
  systolic?: number | null;
  diastolic?: number | null;
  heart_rate?: number | null;
  temperature?: number | null;
  oxygen_saturation?: number | null;
  weight?: number | null;
  pain_level?: number | null;
  notes?: string | null;
}

const STORAGE_KEY = "vigidoc_vitals";

// Aggregate today's vitals from multiple records (most recent value of each type)
export const aggregateTodayVitals = (records: VitalRecord[]): Partial<VitalRecord> => {
  const today = new Date().toDateString();
  const todayRecords = records
    .filter((v) => new Date(v.recorded_at).toDateString() === today)
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

  if (todayRecords.length === 0) return {};

  const aggregated: Partial<VitalRecord> = {};

  for (const record of todayRecords) {
    if (aggregated.systolic === undefined && record.systolic != null) {
      aggregated.systolic = record.systolic;
      aggregated.diastolic = record.diastolic;
    }
    if (aggregated.heart_rate === undefined && record.heart_rate != null) {
      aggregated.heart_rate = record.heart_rate;
    }
    if (aggregated.temperature === undefined && record.temperature != null) {
      aggregated.temperature = record.temperature;
    }
    if (aggregated.oxygen_saturation === undefined && record.oxygen_saturation != null) {
      aggregated.oxygen_saturation = record.oxygen_saturation;
    }
    if (aggregated.weight === undefined && record.weight != null) {
      aggregated.weight = record.weight;
    }
    if (aggregated.pain_level === undefined && record.pain_level != null) {
      aggregated.pain_level = record.pain_level;
    }
  }

  return aggregated;
};

export const useVitals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const mapVital = (v: any): VitalRecord => ({
    id: v.id,
    user_id: v.userId ?? v.user_id,
    recorded_at: v.recordedAt ?? v.recorded_at,
    systolic: v.systolic,
    diastolic: v.diastolic,
    heart_rate: v.heartRate ?? v.heart_rate,
    temperature: v.temperature,
    oxygen_saturation: v.oxygenSaturation ?? v.oxygen_saturation,
    weight: v.weight,
    pain_level: v.painLevel ?? v.pain_level,
    notes: v.notes
  });

  // Load vitals from database or localStorage
  const { data: vitals = [], isLoading: loading, refetch: refresh } = useQuery({
    queryKey: ["vitals", user?.id],
    queryFn: async () => {
      if (!user) {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      }
      
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
      const res = await fetch(`${baseUrl}/api/vitals`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch vitals");
      const data = await res.json();
      const mapped = data.map(mapVital);

      // Sync local data to cloud if exists
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        // Handle sync without blocking
        syncLocalToCloud(JSON.parse(localData));
        localStorage.removeItem(STORAGE_KEY);
      }
      return mapped;
    },
    enabled: !!user || !!localStorage.getItem(STORAGE_KEY),
  });

  const todayVitals = useMemo(() => aggregateTodayVitals(vitals), [vitals]);

  const saveVitalMutation = useMutation({
    mutationFn: async (payload: { recordedAt: string; data: any }) => {
      if (user) {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
        const response = await fetch(`${baseUrl}/api/vitals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            recorded_at: payload.recordedAt,
            ...payload.data,
          })
        });
        if (!response.ok) throw new Error("Error inserting vital");
        return response.json();
      } else {
        const newRecord: VitalRecord = {
          id: crypto.randomUUID(),
          user_id: "local",
          recorded_at: payload.recordedAt,
          ...payload.data
        };
        const stored = localStorage.getItem(STORAGE_KEY);
        const current = stored ? JSON.parse(stored) : [];
        const updated = [...current, newRecord];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newRecord;
      }
    },
    onSuccess: (newVitalRaw) => {
      const newVital = mapVital(newVitalRaw);

      // Manual update of the vitals cache to avoid full re-fetch
      queryClient.setQueryData(["vitals", user?.id], (old: VitalRecord[] | undefined) => {
        return old ? [newVital, ...old] : [newVital];
      });

      // Update dashboard cache if it exists
      queryClient.setQueryData(["dashboard", user?.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          vitals: old.vitals ? [newVitalRaw, ...old.vitals] : [newVitalRaw]
        };
      });
    }
  });

  const syncLocalToCloud = async (localVitals: VitalRecord[]) => {
    if (!user) return;
    setSyncing(true);
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
    for (const vital of localVitals) {
      try {
        await fetch(`${baseUrl}/api/vitals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(vital)
        });
      } catch (error) {
        console.error("Error syncing vital:", error);
      }
    }
    setSyncing(false);
    queryClient.invalidateQueries({ queryKey: ["vitals", user?.id] });
  };

  const saveVital = async (key: string, value: number | string, value2?: number, time?: string) => {
    const today = new Date();
    let recordedAt = today;
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      recordedAt = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    }

    const insertData: Record<string, number | null> = {};
    if (key === "bloodPressure" && value2 !== undefined) {
      insertData.systolic = Number(value);
      insertData.diastolic = value2;
    } else if (key === "heartRate") {
      insertData.heart_rate = Number(value);
    } else if (key === "oxygenSaturation") {
      insertData.oxygen_saturation = Number(value);
    } else if (key === "painLevel") {
      insertData.pain_level = Number(value);
    } else {
      insertData[key] = Number(value);
    }

    return saveVitalMutation.mutateAsync({
      recordedAt: recordedAt.toISOString(),
      data: insertData
    });
  };

  const getStatus = (key: string, value?: number | null): VitalStatus => {
    return getVitalStatus(key, value);
  };

  return { 
    vitals, 
    todayVitals, 
    saveVital, 
    getStatus, 
    loading, 
    syncing, 
    refresh 
  };
};
