import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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

export const useVitals = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [todayVitals, setTodayVitals] = useState<Partial<VitalRecord>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Aggregate today's vitals from multiple records (most recent value of each type)
  const aggregateTodayVitals = (records: VitalRecord[]): Partial<VitalRecord> => {
    const today = new Date().toDateString();
    const todayRecords = records
      .filter((v) => new Date(v.recorded_at).toDateString() === today)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

    if (todayRecords.length === 0) return {};

    // Aggregate: get the most recent non-null value for each vital type
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

  // Load vitals from database or localStorage
  const loadVitals = useCallback(async () => {
    setLoading(true);
    
    if (user) {
      // Load from Supabase
      const { data, error } = await supabase
        .from("vital_records")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false });

      if (!error && data) {
        setVitals(data);
        setTodayVitals(aggregateTodayVitals(data));

        // Sync local data to cloud if exists
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          await syncLocalToCloud(JSON.parse(localData));
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } else {
      // Load from localStorage (offline mode)
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setVitals(parsed);
        setTodayVitals(aggregateTodayVitals(parsed));
      }
    }
    
    setLoading(false);
  }, [user]);

  // Sync local data to cloud
  const syncLocalToCloud = async (localVitals: VitalRecord[]) => {
    if (!user) return;
    
    setSyncing(true);
    
    for (const vital of localVitals) {
      const { error } = await supabase.from("vital_records").insert({
        user_id: user.id,
        recorded_at: vital.recorded_at,
        systolic: vital.systolic,
        diastolic: vital.diastolic,
        heart_rate: vital.heart_rate,
        temperature: vital.temperature,
        oxygen_saturation: vital.oxygen_saturation,
        weight: vital.weight,
        pain_level: vital.pain_level,
        notes: vital.notes
      });
      
      if (error) {
        console.error("Error syncing vital:", error);
      }
    }
    
    setSyncing(false);
    loadVitals();
  };

  useEffect(() => {
    loadVitals();
  }, [loadVitals]);

  const saveVital = async (key: string, value: number | string, value2?: number, time?: string) => {
    const today = new Date();
    
    // Cria timestamp com a hora informada
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

    if (user) {
      // Sempre cria um novo registro (permite múltiplas medições por dia)
      const { error } = await supabase.from("vital_records").insert({
        user_id: user.id,
        recorded_at: recordedAt.toISOString(),
        ...insertData
      });

      if (error) {
        console.error("Error inserting vital:", error);
      }

      loadVitals();
    } else {
      // Save to localStorage (offline mode) - sempre cria novo registro
      setVitals((prev) => {
        const newRecord: VitalRecord = {
          id: crypto.randomUUID(),
          user_id: "local",
          recorded_at: recordedAt.toISOString(),
          ...insertData
        };
        
        const updated = [...prev, newRecord];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        // Atualiza todayVitals agregando todos os valores do dia
        setTodayVitals(aggregateTodayVitals(updated));

        return updated;
      });
    }
  };

  const getStatus = (
    key: string,
    value?: number | null
  ): "normal" | "warning" | "alert" => {
    if (value === undefined || value === null) return "normal";

    const ranges: Record<string, { normal: [number, number]; warning: [number, number] }> = {
      systolic: { normal: [90, 120], warning: [121, 140] },
      diastolic: { normal: [60, 80], warning: [81, 90] },
      heart_rate: { normal: [60, 100], warning: [50, 110] },
      temperature: { normal: [36, 37.5], warning: [37.6, 38.5] },
      oxygen_saturation: { normal: [95, 100], warning: [90, 94] },
      pain_level: { normal: [0, 3], warning: [4, 6] },
    };

    const range = ranges[key];
    if (!range) return "normal";

    if (value >= range.normal[0] && value <= range.normal[1]) return "normal";
    if (value >= range.warning[0] && value <= range.warning[1]) return "warning";
    return "alert";
  };

  return { vitals, todayVitals, saveVital, getStatus, loading, syncing, refresh: loadVitals };
};
