// types/patient.ts
// Tipos centrais para a feature de listagem de pacientes

/** Status de um sinal vital */
export type VitalStatus = 'normal' | 'warning' | 'alert' | 'critical';

/** Valor individual de um sinal vital */
export interface VitalValue {
  label: string;
  value: number | string;
  unit: string;
  status: VitalStatus;
}

/** Sessão de registro (último registro ou item do histórico) */
export interface RecordSession {
  date: string; // ISO date string
  heartRate: VitalValue;
  bloodPressure: VitalValue;
  oxygenSaturation: VitalValue;
  temperature: VitalValue;
  weight: VitalValue;
  pain: VitalValue;
}

/** Score de performance ECOG (0 = assintomático, 4 = acamado) */
export type EcogScore = 0 | 1 | 2 | 3 | 4;

/** Paciente completo */
export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  avatarUrl: string | null;

  // Dados pessoais expandidos
  dateOfBirth: string; // ISO date string
  admissionDate: string; // ISO date string

  // Dados clínicos (oncologia)
  diseaseType: string; // ex: "Câncer de Pulmão"
  cid: string; // código CID-10 (ex: "C34.9")
  ecog: EcogScore; // score ECOG 0–4
  diagnosis: string; // diagnóstico resumido

  // Registros de sinais vitais
  lastRecord: RecordSession;
  dailyHistory: RecordSession[];
}
