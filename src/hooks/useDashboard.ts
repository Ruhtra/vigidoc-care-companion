import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface DashboardData {
  user: any;
  profile: any;
  vitals: any[];
  reminders: any[];
}

export const useDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: async (): Promise<DashboardData> => {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${baseUrl}/api/dashboard`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();

      // Pre-populate individual caches
      if (user?.id) {
        if (data.profile) {
          queryClient.setQueryData(["profile", user.id], {
             id: data.profile.userId,
             user_id: data.profile.userId,
             full_name: user.name || null,
             birth_date: data.profile.birthDate || null,
             phone: data.profile.phone || null,
             emergency_contact: data.profile.emergencyContact || null,
             medical_notes: data.profile.medicalNotes || null,
          });
        }
        
        if (data.vitals) {
          queryClient.setQueryData(["vitals", user.id], data.vitals.map((v: any) => ({
            id: v.id,
            user_id: v.userId,
            recorded_at: v.recordedAt,
            systolic: v.systolic,
            diastolic: v.diastolic,
            heart_rate: v.heartRate,
            temperature: v.temperature,
            oxygen_saturation: v.oxygenSaturation,
            weight: v.weight,
            pain_level: v.painLevel,
            notes: v.notes
          })));
        }

        if (data.reminders) {
          queryClient.setQueryData(["reminders", user.id], data.reminders.map((r: any) => ({
            id: r.id,
            user_id: r.userId,
            time: r.time,
            label: r.label,
            enabled: r.enabled,
            days: r.days,
            reminder_type: r.reminderType,
            created_at: r.createdAt,
            updated_at: r.updatedAt,
          })));
        }
      }

      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
