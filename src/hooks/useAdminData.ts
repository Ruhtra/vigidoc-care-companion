import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

interface VitalRecord {
  id: string;
  recorded_at: string;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  pain_level: number | null;
}

interface PatientData {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  birth_date: string | null;
  emergency_contact: string | null;
  medical_notes: string | null;
  vitals: VitalRecord[] | null;
}

interface AdminDataResult {
  patients: PatientData[];
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  refetch: (
    dateFrom?: string,
    dateTo?: string,
    userId?: string
  ) => Promise<void>;
}

export const useAdminData = (): AdminDataResult => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = () => {
    if (!user) return false;
    // @ts-ignore
    return user.role === "admin";
  };

  const fetchData = async (
    dateFrom?: string,
    dateTo?: string,
    userId?: string
  ) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const adminStatus = checkAdminStatus();
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        setError("Você não tem permissão para acessar esta página");
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (userId) params.append("userId", userId);

      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${baseUrl}/api/admin/patients?${params.toString()}`);
      if (!response.ok) {
         if (response.status === 403) {
            setError("Você não tem permissão para acessar esta página");
         } else {
             const errData = await response.json();
             setError(errData.error || "Erro ao carregar dados dos pacientes");
         }
         setPatients([]);
      } else {
         const data = await response.json();
         setPatients(data || []);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Erro ao carregar dados dos pacientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return {
    patients,
    isLoading,
    error,
    isAdmin,
    refetch: fetchData,
  };
};
