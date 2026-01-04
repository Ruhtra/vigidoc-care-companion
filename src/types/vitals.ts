export interface VitalRecord {
  id: string;
  date: Date;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  painLevel?: number;
  notes?: string;
}

export interface VitalType {
  key: keyof Omit<VitalRecord, "id" | "date" | "notes">;
  label: string;
  unit: string;
  normalRange?: { min: number; max: number };
}
