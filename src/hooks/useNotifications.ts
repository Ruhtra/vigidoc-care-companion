"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Reminder {
  id: string;
  time: string;
  label: string;
  days: string[];
  enabled: boolean;
  reminder_type: string;
  lastFired?: string;
}

export const useNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visibilityRef = useRef<(() => void) | null>(null);

  // Register the SW and start keep-alive ping
  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      registerServiceWorker();
    }

    return () => {
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      if (visibilityRef.current) {
        document.removeEventListener("visibilitychange", visibilityRef.current);
      }
    };
  }, []);

  const registerServiceWorker =
    async (): Promise<ServiceWorkerRegistration | null> => {
      try {
        // Always register (the browser will use the existing one if unchanged)
        const registration = await navigator.serviceWorker.register(
          "/sw-custom.js",
          { scope: "/" }
        );

        console.log(
          "[Notifications] Service Worker registrado:",
          registration.scope
        );

        // Wait for the SW to become active
        if (registration.installing) {
          await new Promise<void>((resolve) => {
            const sw = registration.installing!;
            sw.addEventListener("statechange", () => {
              if (sw.state === "activated") resolve();
            });
          });
        } else if (registration.waiting) {
          // There's a waiting worker, tell it to activate
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          await new Promise<void>((resolve) => {
            const sw = registration.waiting!;
            sw.addEventListener("statechange", () => {
              if (sw.state === "activated") resolve();
            });
          });
        }

        await navigator.serviceWorker.ready;
        setSwRegistration(registration);
        console.log("[Notifications] Service Worker pronto");

        // Start keep-alive ping to prevent SW from going idle
        startKeepAlive();

        // Try to register periodic background sync (Chrome 80+)
        try {
          const periodicSyncStatus = await navigator.permissions.query({
            // @ts-expect-error - periodicSync is not yet widely typed
            name: "periodic-background-sync",
          });
          if (periodicSyncStatus.state === "granted") {
            // @ts-expect-error - periodicSync is not yet widely typed
            await registration.periodicSync.register("check-reminders", {
              minInterval: 60 * 1000, // 1 minute minimum
            });
            console.log("[Notifications] Periodic background sync registrado");
          }
        } catch {
          console.log("[Notifications] Periodic background sync nao suportado");
        }

        return registration;
      } catch (error) {
        console.error(
          "[Notifications] Erro ao registrar Service Worker:",
          error
        );
        return null;
      }
    };

  // Ping the SW periodically to keep it alive and checking reminders
  const startKeepAlive = () => {
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);

    const ping = () => {
      navigator.serviceWorker.controller?.postMessage({ type: "PING" });
    };

    // Ping every 20 seconds while the page is open
    keepAliveRef.current = setInterval(ping, 20_000);
    ping(); // Immediate first ping

    // Also ping when the tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        ping();
      }
    };
    visibilityRef.current = handleVisibility;
    document.addEventListener("visibilitychange", handleVisibility);
  };

  const sendMessageToSW = useCallback(
    (type: string, payload?: unknown): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        if (!navigator.serviceWorker.controller) {
          // SW might not be controlling the page yet
          navigator.serviceWorker.ready.then((reg) => {
            const sw = reg.active;
            if (sw) {
              const channel = new MessageChannel();
              channel.port1.onmessage = (e) => resolve(e.data);
              sw.postMessage({ type, payload }, [channel.port2]);
            } else {
              reject(new Error("No active service worker"));
            }
          });
          return;
        }

        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => resolve(e.data);
        navigator.serviceWorker.controller.postMessage({ type, payload }, [
          channel.port2,
        ]);

        // Timeout after 5 seconds
        setTimeout(() => resolve({ success: true, timeout: true }), 5000);
      });
    },
    []
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log("[Notifications] Notificacoes nao suportadas");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      console.log("[Notifications] Permissao solicitada, resultado:", result);
      setPermission(result);

      if (result === "granted") {
        await registerServiceWorker();
      }

      return result === "granted";
    } catch (error) {
      console.error("[Notifications] Erro ao solicitar permissao:", error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== "granted") return false;

      try {
        let registration = swRegistration;
        if (!registration) {
          registration = await navigator.serviceWorker.ready;
        }

        if (registration) {
          await registration.showNotification(title, {
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            // vibrate: [200, 100, 200],
            requireInteraction: false,
            tag: `vigidoc-${Date.now()}`,
            ...options,
          });
          console.log("[Notifications] Notificacao exibida via SW:", title);
          return true;
        }

        // Fallback
        new Notification(title, { icon: "/icon-192.png", ...options });
        return true;
      } catch (error) {
        console.error("[Notifications] Erro ao exibir notificacao:", error);
        try {
          new Notification(title, { icon: "/icon-192.png", ...options });
          return true;
        } catch {
          return false;
        }
      }
    },
    [isSupported, permission, swRegistration]
  );

  /**
   * Sync all reminders to the Service Worker's IndexedDB.
   * The SW will independently check and fire them even when the app is closed.
   */
  const syncRemindersToSW = useCallback(
    async (reminders: Reminder[]) => {
      try {
        const result = await sendMessageToSW("SYNC_REMINDERS", reminders);
        console.log("[Notifications] Lembretes sincronizados com SW:", result);
        return true;
      } catch (error) {
        console.error("[Notifications] Erro ao sincronizar com SW:", error);
        return false;
      }
    },
    [sendMessageToSW]
  );

  const addReminderToSW = useCallback(
    async (reminder: Reminder) => {
      try {
        await sendMessageToSW("ADD_REMINDER", reminder);
        console.log(
          "[Notifications] Lembrete adicionado no SW:",
          reminder.label
        );
        return true;
      } catch (error) {
        console.error("[Notifications] Erro ao adicionar no SW:", error);
        return false;
      }
    },
    [sendMessageToSW]
  );

  const deleteReminderFromSW = useCallback(
    async (id: string) => {
      try {
        await sendMessageToSW("DELETE_REMINDER", { id });
        console.log("[Notifications] Lembrete removido do SW:", id);
        return true;
      } catch (error) {
        console.error("[Notifications] Erro ao remover do SW:", error);
        return false;
      }
    },
    [sendMessageToSW]
  );

  const updateReminderInSW = useCallback(
    async (reminder: Reminder) => {
      try {
        await sendMessageToSW("UPDATE_REMINDER", reminder);
        console.log("[Notifications] Lembrete atualizado no SW:", reminder.id);
        return true;
      } catch (error) {
        console.error("[Notifications] Erro ao atualizar no SW:", error);
        return false;
      }
    },
    [sendMessageToSW]
  );

  const testNotification = useCallback(async () => {
    try {
      await sendMessageToSW("TEST_NOTIFICATION", {
        body: "Notificacoes funcionando corretamente!",
      });
      return true;
    } catch {
      return showNotification("VigiDoc - Teste", {
        body: "Notificacoes funcionando corretamente!",
      });
    }
  }, [sendMessageToSW, showNotification]);

  const toggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    console.log("[Notifications] Som", enabled ? "ativado" : "desativado");
  }, []);

  return {
    permission,
    isSupported,
    swRegistration,
    soundEnabled,
    requestPermission,
    showNotification,
    syncRemindersToSW,
    addReminderToSW,
    deleteReminderFromSW,
    updateReminderInSW,
    testNotification,
    toggleSound,
  };
};
