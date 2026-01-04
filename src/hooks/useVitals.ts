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
        
        // Find today's record
        const today = new Date().toDateString();
        const todayRecord = data.find(
          (v) => new Date(v.recorded_at).toDateString() === today
        );
        if (todayRecord) {
          setTodayVitals(todayRecord);
        }

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
        
        const today = new Date().toDateString();
        const todayRecord = parsed.find(
          (v: VitalRecord) => new Date(v.recorded_at).toDateString() === today
        );
        if (todayRecord) {
          setTodayVitals(todayRecord);
        }
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

  const saveVital = async (key: string, value: number | string, value2?: number) => {
    const today = new Date();
    const todayStr = today.toDateString();

    if (user) {
      // Save to Supabase
      const existingRecord = vitals.find(
        (v) => new Date(v.recorded_at).toDateString() === todayStr
      );

      const updateData: Record<string, number | null> = {};
      
      if (key === "bloodPressure" && value2 !== undefined) {
        updateData.systolic = Number(value);
        updateData.diastolic = value2;
      } else if (key === "heartRate") {
        updateData.heart_rate = Number(value);
      } else if (key === "oxygenSaturation") {
        updateData.oxygen_saturation = Number(value);
      } else if (key === "painLevel") {
        updateData.pain_level = Number(value);
      } else {
        updateData[key] = Number(value);
      }

      if (existingRecord) {
        const { error } = await supabase
          .from("vital_records")
          .update(updateData)
          .eq("id", existingRecord.id);

        if (error) {
          console.error("Error updating vital:", error);
        }
      } else {
        const { error } = await supabase.from("vital_records").insert({
          user_id: user.id,
          recorded_at: today.toISOString(),
          ...updateData
        });

        if (error) {
          console.error("Error inserting vital:", error);
        }
      }

      loadVitals();
    } else {
      // Save to localStorage (offline mode)
      setVitals((prev) => {
        const existingIndex = prev.findIndex(
          (v) => new Date(v.recorded_at).toDateString() === todayStr
        );

        let updated: VitalRecord[];

        if (existingIndex >= 0) {
          updated = [...prev];
          if (key === "bloodPressure" && value2 !== undefined) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              systolic: Number(value),
              diastolic: value2,
            };
          } else if (key === "heartRate") {
            updated[existingIndex] = { ...updated[existingIndex], heart_rate: Number(value) };
          } else if (key === "oxygenSaturation") {
            updated[existingIndex] = { ...updated[existingIndex], oxygen_saturation: Number(value) };
          } else if (key === "painLevel") {
            updated[existingIndex] = { ...updated[existingIndex], pain_level: Number(value) };
          } else if (key === "temperature") {
            updated[existingIndex] = { ...updated[existingIndex], temperature: Number(value) };
          } else if (key === "weight") {
            updated[existingIndex] = { ...updated[existingIndex], weight: Number(value) };
          }
        } else {
          const newRecord: VitalRecord = {
            id: crypto.randomUUID(),
            user_id: "local",
            recorded_at: today.toISOString(),
          };
          if (key === "bloodPressure" && value2 !== undefined) {
            newRecord.systolic = Number(value);
            newRecord.diastolic = value2;
          } else if (key === "heartRate") {
            newRecord.heart_rate = Number(value);
          } else if (key === "oxygenSaturation") {
            newRecord.oxygen_saturation = Number(value);
          } else if (key === "painLevel") {
            newRecord.pain_level = Number(value);
          } else if (key === "temperature") {
            newRecord.temperature = Number(value);
          } else if (key === "weight") {
            newRecord.weight = Number(value);
          }
          updated = [...prev, newRecord];
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        const todayRecord = updated.find((v) => new Date(v.recorded_at).toDateString() === todayStr);
        if (todayRecord) {
          setTodayVitals(todayRecord);
        }

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
