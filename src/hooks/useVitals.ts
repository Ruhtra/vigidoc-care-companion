import { useState, useEffect } from "react";
import { VitalRecord } from "@/types/vitals";

const STORAGE_KEY = "vigidoc_vitals";

export const useVitals = () => {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [todayVitals, setTodayVitals] = useState<Partial<VitalRecord>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored).map((v: VitalRecord) => ({
        ...v,
        date: new Date(v.date),
      }));
      setVitals(parsed);
      
      // Find today's record
      const today = new Date().toDateString();
      const todayRecord = parsed.find(
        (v: VitalRecord) => v.date.toDateString() === today
      );
      if (todayRecord) {
        setTodayVitals(todayRecord);
      }
    }
  }, []);

  const saveVital = (key: string, value: number | string, value2?: number) => {
    const today = new Date();
    const todayStr = today.toDateString();

    setVitals((prev) => {
      const existingIndex = prev.findIndex(
        (v) => v.date.toDateString() === todayStr
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
        } else {
          updated[existingIndex] = {
            ...updated[existingIndex],
            [key]: Number(value),
          };
        }
      } else {
        const newRecord: VitalRecord = {
          id: crypto.randomUUID(),
          date: today,
        };
        if (key === "bloodPressure" && value2 !== undefined) {
          newRecord.systolic = Number(value);
          newRecord.diastolic = value2;
        } else if (key === "heartRate") {
          newRecord.heartRate = Number(value);
        } else if (key === "temperature") {
          newRecord.temperature = Number(value);
        } else if (key === "oxygenSaturation") {
          newRecord.oxygenSaturation = Number(value);
        } else if (key === "weight") {
          newRecord.weight = Number(value);
        } else if (key === "painLevel") {
          newRecord.painLevel = Number(value);
        }
        updated = [...prev, newRecord];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      const todayRecord = updated.find((v) => v.date.toDateString() === todayStr);
      if (todayRecord) {
        setTodayVitals(todayRecord);
      }

      return updated;
    });
  };

  const getStatus = (
    key: string,
    value?: number
  ): "normal" | "warning" | "alert" => {
    if (value === undefined) return "normal";

    const ranges: Record<string, { normal: [number, number]; warning: [number, number] }> = {
      systolic: { normal: [90, 120], warning: [121, 140] },
      diastolic: { normal: [60, 80], warning: [81, 90] },
      heartRate: { normal: [60, 100], warning: [50, 110] },
      temperature: { normal: [36, 37.5], warning: [37.6, 38.5] },
      oxygenSaturation: { normal: [95, 100], warning: [90, 94] },
      painLevel: { normal: [0, 3], warning: [4, 6] },
    };

    const range = ranges[key];
    if (!range) return "normal";

    if (value >= range.normal[0] && value <= range.normal[1]) return "normal";
    if (value >= range.warning[0] && value <= range.warning[1]) return "warning";
    return "alert";
  };

  return { vitals, todayVitals, saveVital, getStatus };
};
