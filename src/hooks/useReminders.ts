import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReminders = useCallback(async () => {
    setLoading(true);

    if (user) {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("time", { ascending: true });

      if (!error && data) {
        setReminders(data as Reminder[]);

        // Sync local data to cloud if exists
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          const localReminders = JSON.parse(localData);
          for (const reminder of localReminders) {
            await supabase.from("reminders").insert({
              user_id: user.id,
              time: reminder.time,
              label: reminder.label,
              enabled: reminder.enabled,
              days: reminder.days,
              reminder_type: reminder.reminder_type || "vital_collection",
            });
          }
          localStorage.removeItem(STORAGE_KEY);
          loadReminders();
        }
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      } else {
        // Default reminders for new users
        setReminders([
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
        ]);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const addReminder = async (
    time: string,
    label: string,
    days: string[],
    reminderType: "vital_collection" | "medication" | "custom" = "vital_collection"
  ) => {
    if (user) {
      const { error } = await supabase.from("reminders").insert({
        user_id: user.id,
        time,
        label,
        days,
        reminder_type: reminderType,
        enabled: true,
      });

      if (!error) {
        loadReminders();
      }
      return !error;
    } else {
      const newReminder: Reminder = {
        id: crypto.randomUUID(),
        user_id: "local",
        time,
        label,
        enabled: true,
        days,
        reminder_type: reminderType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setReminders((prev) => {
        const updated = [...prev, newReminder];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      return true;
    }
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    if (user) {
      const { error } = await supabase
        .from("reminders")
        .update({ enabled: !reminder.enabled })
        .eq("id", id);

      if (!error) {
        loadReminders();
      }
    } else {
      setReminders((prev) => {
        const updated = prev.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteReminder = async (id: string) => {
    if (user) {
      const { error } = await supabase.from("reminders").delete().eq("id", id);

      if (!error) {
        loadReminders();
      }
    } else {
      setReminders((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  return {
    reminders,
    loading,
    addReminder,
    toggleReminder,
    deleteReminder,
    refresh: loadReminders,
  };
};
