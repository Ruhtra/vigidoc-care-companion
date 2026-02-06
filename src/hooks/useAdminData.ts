import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

  const checkAdminStatus = async () => {
    if (!user) return false;

    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data === true;
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
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        setError("Você não tem permissão para acessar esta página");
        setIsLoading(false);
        return;
      }

      const { data, error: rpcError } = await supabase.rpc(
        "get_admin_patients_data",
        {
          date_from_param: dateFrom || null,
          date_to_param: dateTo || null,
          user_id_param: userId || null,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      if (data && typeof data === "object" && "error" in (data as object)) {
        setError((data as { error: string }).error);
        setPatients([]);
      } else {
        setPatients((data as unknown as PatientData[]) || []);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Erro ao carregar dados dos pacientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    patients,
    isLoading,
    error,
    isAdmin,
    refetch: fetchData,
  };
};
