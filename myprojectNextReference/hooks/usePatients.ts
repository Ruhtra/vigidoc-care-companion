// hooks/usePatients.ts
// Hook customizado para buscar lista de pacientes via TanStack Query

import { useQuery } from '@tanstack/react-query';
import type { Patient } from '@/types/patient';

/**
 * Busca de lista de pacientes na API.
 */
const fetchPatients = async (): Promise<Patient[]> => {
  const res = await fetch('/api/patients');
  if (!res.ok) {
    throw new Error('Falha ao carregar lista de pacientes');
  }
  return res.json();
};

/**
 * Hook para buscar e cachear a lista de pacientes.
 * Expõe data, isLoading, isError, error e refetch.
 */
export const usePatients = () =>
  useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  });
