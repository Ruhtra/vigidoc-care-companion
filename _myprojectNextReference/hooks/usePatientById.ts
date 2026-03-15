// hooks/usePatientById.ts
// Hook para buscar um paciente específico por ID via TanStack Query

import { useQuery } from '@tanstack/react-query';
import type { Patient } from '@/types/patient';

/**
 * Busca de paciente por ID na API.
 */
const fetchPatientById = async (id: string): Promise<Patient | null> => {
  const res = await fetch(`/api/patients/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Falha ao carregar paciente');
  }
  return res.json();
};

/**
 * Hook para buscar e cachear um paciente por ID.
 * Expõe data, isLoading, isError, error e refetch.
 */
export const usePatientById = (id: string) =>
  useQuery<Patient | null>({
    queryKey: ['patient', id],
    queryFn: () => fetchPatientById(id),
    enabled: !!id,
  });
