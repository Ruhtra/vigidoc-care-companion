import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().trim().max(100, "Nome deve ter no máximo 100 caracteres").optional(),
  birth_date: z.string().optional(),
  phone: z.string().trim().max(20, "Telefone deve ter no máximo 20 caracteres").optional(),
  emergency_contact: z.string().trim().max(100, "Contato deve ter no máximo 100 caracteres").optional(),
  medical_notes: z.string().trim().max(1000, "Notas devem ter no máximo 1000 caracteres").optional(),
});

export type ProfileData = z.infer<typeof profileSchema>;

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  birth_date: string | null;
  phone: string | null;
  emergency_contact: string | null;
  medical_notes: string | null;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = "vigidoc_profile";

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loading, refetch: refresh } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        return null;
      }
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      return {
        id: data.userId,
        user_id: data.userId,
        full_name: user.name || null,
        birth_date: data.birthDate || null,
        phone: data.phone || null,
        emergency_contact: data.emergencyContact || null,
        medical_notes: data.medicalNotes || null,
      } as Profile;
    },
    enabled: !!user || !!localStorage.getItem(STORAGE_KEY),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      // Validate data
      const validation = profileSchema.safeParse(data);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      if (user) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: data.phone || null,
            birthDate: data.birth_date || null,
            emergencyContact: data.emergency_contact || null,
            medicalNotes: data.medical_notes || null,
          })
        });

        if (!response.ok) {
          throw new Error("Erro ao atualizar no backend");
        }
        return true;
      } else {
        const updatedProfile: Profile = {
          id: profile?.id || crypto.randomUUID(),
          user_id: "local",
          full_name: data.full_name || null,
          birth_date: data.birth_date || null,
          phone: data.phone || null,
          emergency_contact: data.emergency_contact || null,
          medical_notes: data.medical_notes || null,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
        return updatedProfile;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
    }
  });

  const getInitials = (): string => {
    if (!profile?.full_name) return "?";
    const names = profile.full_name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return {
    profile: profile || null,
    loading,
    saving: updateProfileMutation.isPending,
    updateProfile: async (data: ProfileData) => {
      try {
        await updateProfileMutation.mutateAsync(data);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    getInitials,
    refresh,
  };
};
