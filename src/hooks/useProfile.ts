import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "vigidoc_profile";

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);

    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
      } else if (!data) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (!insertError && newProfile) {
          setProfile(newProfile as Profile);
        }
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (data: ProfileData): Promise<{ success: boolean; error?: string }> => {
    // Validate data
    const validation = profileSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    setSaving(true);

    try {
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: data.full_name || null,
            birth_date: data.birth_date || null,
            phone: data.phone || null,
            emergency_contact: data.emergency_contact || null,
            medical_notes: data.medical_notes || null,
          })
          .eq("user_id", user.id);

        if (error) {
          setSaving(false);
          return { success: false, error: error.message };
        }

        await loadProfile();
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

        setProfile(updatedProfile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      }

      setSaving(false);
      return { success: true };
    } catch (err) {
      setSaving(false);
      return { success: false, error: "Erro ao salvar perfil" };
    }
  };

  const getInitials = (): string => {
    if (!profile?.full_name) return "?";
    const names = profile.full_name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return {
    profile,
    loading,
    saving,
    updateProfile,
    getInitials,
    refresh: loadProfile,
  };
};
