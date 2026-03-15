import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface Reminder {
  id: string;
  user_id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
  reminder_type: "vital_collection" | "medication" | "custom";
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "vigidoc_reminders";

export const useReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading: loading, refetch: refresh } = useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      if (!user) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        return [
          {
            id: "1",
            user_id: "local",
            time: "08:00",
            label: "Coleta da manhã",
            enabled: true,
            days: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            reminder_type: "vital_collection",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            user_id: "local",
            time: "14:00",
            label: "Coleta da tarde",
            enabled: true,
            days: ["Seg", "Ter", "Qua", "Qui", "Sex"],
            reminder_type: "vital_collection",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }

      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${baseUrl}/api/reminders`);
      if (!response.ok) throw new Error("Failed to fetch reminders");
      const data = await response.json();
      const mapped = data.map((r: any) => ({
        id: r.id,
        user_id: r.userId,
        time: r.time,
        label: r.label,
        enabled: r.enabled,
        days: r.days,
        reminder_type: r.reminderType,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      }));

      // Sync local data to cloud
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const localReminders = JSON.parse(localData);
        for (const reminder of localReminders) {
          await fetch(`${baseUrl}/api/reminders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reminder)
          });
        }
        localStorage.removeItem(STORAGE_KEY);
        queryClient.invalidateQueries({ queryKey: ["reminders", user?.id] });
      }

      return mapped;
    },
    enabled: !!user || true, // Always enable, either local or cloud
  });

  const addReminderMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (user) {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
        const response = await fetch(`${baseUrl}/api/reminders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Error adding reminder");
        return response.json();
      } else {
        const newReminder: Reminder = {
          id: crypto.randomUUID(),
          user_id: "local",
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const stored = localStorage.getItem(STORAGE_KEY);
        const current = stored ? JSON.parse(stored) : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, newReminder]));
        return newReminder;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
    }
  });

  const toggleReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;

      if (user) {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
        const response = await fetch(`${baseUrl}/api/reminders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: !reminder.enabled })
        });
        if (!response.ok) throw new Error("Error toggling reminder");
      } else {
        const updated = reminders.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
    }
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      if (user) {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
        const response = await fetch(`${baseUrl}/api/reminders/${id}`, {
          method: "DELETE"
        });
        if (!response.ok) throw new Error("Error deleting reminder");
      } else {
        const updated = reminders.filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] });
    }
  });

  return {
    reminders,
    loading,
    addReminder: (time: string, label: string, days: string[], reminderType: string = "vital_collection") => 
      addReminderMutation.mutateAsync({ time, label, days, reminder_type: reminderType, enabled: true }),
    toggleReminder: (id: string) => toggleReminderMutation.mutateAsync(id),
    deleteReminder: (id: string) => deleteReminderMutation.mutateAsync(id),
    refresh,
  };
};
