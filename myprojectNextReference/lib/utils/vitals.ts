import type { VitalStatus } from '@/types/patient';

/**
 * Funções específicas MEWS (Modified Early Warning Score)
 * Categorias:
 * normal (Verde)
 * warning (Amarelo)
 * alert (Laranja)
 * critical (Vermelho)
 */

export function resolveHeartRate(value: number | null | undefined): VitalStatus {
  if (value === null || value === undefined) return 'normal';
  if (value <= 40 || (value >= 111 && value <= 129)) return 'alert'; // Laranja
  if (value >= 130) return 'critical'; // Vermelho
  if ((value >= 41 && value <= 50) || (value >= 101 && value <= 110)) return 'warning'; // Amarelo
  return 'normal'; // Verde (51-100)
}

export function resolveO2Saturation(value: number | null | undefined): VitalStatus {
  if (value === null || value === undefined) return 'normal';
  if (value <= 91) return 'critical'; // Vermelho
  if (value === 92 || value === 93) return 'alert'; // Laranja
  if (value === 94 || value === 95) return 'warning'; // Amarelo
  return 'normal'; // Verde (>= 96)
}

export function resolveTemperature(value: number | null | undefined): VitalStatus {
  if (value === null || value === undefined) return 'normal';
  if (value < 35 || value > 39) return 'alert'; // Laranja
  if ((value >= 35.1 && value <= 36) || (value >= 38 && value <= 38.9)) return 'warning'; // Amarelo
  return 'normal'; // Verde (36.1 - 37.9)
}

export function resolveSystolicPressure(value: number | null | undefined): VitalStatus {
  if (value === null || value === undefined) return 'normal';
  if (value < 70 || value > 200) return 'critical'; // Vermelho
  if ((value >= 71 && value <= 80) || (value >= 180 && value <= 199)) return 'alert'; // Laranja
  if (value >= 81 && value <= 100) return 'warning'; // Amarelo
  return 'normal'; // Verde (101 - 179)
}

export function resolvePain(value: number | null | undefined): VitalStatus {
  // O usuário não incluiu a dor no MEWS enviado, mas manteremos o score antigo ou fixaremos logica basica.
  if (value === null || value === undefined) return 'normal';
  if (value >= 0 && value <= 3) return 'normal'; // Verde
  if (value >= 4 && value <= 6) return 'warning'; // Amarelo
  if (value >= 7 && value <= 8) return 'alert'; // Laranja
  return 'critical'; // Vermelho (9-10)
}

// Para campos não cobertos: weight
export function resolveGeneric(value: any): VitalStatus {
  return 'normal';
}
