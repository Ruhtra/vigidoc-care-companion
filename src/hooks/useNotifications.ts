import { useState, useEffect, useCallback, useRef } from "react";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const scheduledTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Check if notifications are supported
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Register custom service worker for notifications
      registerServiceWorker();
    }
    
    return () => {
      // Clear all scheduled timeouts on unmount
      scheduledTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      scheduledTimeouts.current.clear();
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      // First check if there's an existing SW registration
      const existingReg = await navigator.serviceWorker.getRegistration();
      if (existingReg) {
        console.log("[Notifications] Service Worker já registrado:", existingReg.scope);
        setSwRegistration(existingReg);
        return existingReg;
      }

      // Register the custom service worker
      const registration = await navigator.serviceWorker.register("/sw-custom.js", {
        scope: "/"
      });
      
      console.log("[Notifications] Service Worker registrado com sucesso:", registration.scope);
      setSwRegistration(registration);
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      console.log("[Notifications] Service Worker pronto");
      
      return registration;
    } catch (error) {
      console.error("[Notifications] Erro ao registrar Service Worker:", error);
      return null;
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log("[Notifications] Notificações não suportadas");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      console.log("[Notifications] Permissão solicitada, resultado:", result);
      setPermission(result);
      
      if (result === "granted") {
        // Ensure SW is registered after permission granted
        await registerServiceWorker();
      }
      
      return result === "granted";
    } catch (error) {
      console.error("[Notifications] Erro ao solicitar permissão:", error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!isSupported) {
        console.log("[Notifications] Notificações não suportadas");
        return false;
      }
      
      if (permission !== "granted") {
        console.log("[Notifications] Permissão não concedida:", permission);
        return false;
      }

      try {
        // Try to use service worker for better PWA support
        let registration = swRegistration;
        
        if (!registration) {
          registration = await navigator.serviceWorker.ready;
        }
        
        if (registration) {
          await registration.showNotification(title, {
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            requireInteraction: false,
            tag: `vigidoc-${Date.now()}`,
            ...options,
          });
          console.log("[Notifications] Notificação exibida via SW:", title);
          return true;
        } else {
          // Fallback to regular notification
          const notification = new Notification(title, {
            icon: "/icon-192.png",
            ...options,
          });
          console.log("[Notifications] Notificação exibida via API:", title);
          return true;
        }
      } catch (error) {
        console.error("[Notifications] Erro ao exibir notificação:", error);
        
        // Last resort fallback
        try {
          new Notification(title, {
            icon: "/icon-192.png",
            ...options,
          });
          console.log("[Notifications] Fallback - Notificação exibida:", title);
          return true;
        } catch (fallbackError) {
          console.error("[Notifications] Fallback também falhou:", fallbackError);
          return false;
        }
      }
    },
    [isSupported, permission, swRegistration]
  );

  const scheduleLocalNotification = useCallback(
    (title: string, body: string, scheduledTime: Date, id?: string) => {
      const now = new Date();
      const delay = scheduledTime.getTime() - now.getTime();

      if (delay <= 0) {
        console.log("[Notifications] Horário agendado já passou:", scheduledTime);
        return null;
      }

      const notificationId = id || `notification-${Date.now()}`;
      
      // Clear existing timeout for this ID if exists
      const existingTimeout = scheduledTimeouts.current.get(notificationId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      console.log(`[Notifications] Agendando notificação "${title}" para daqui ${Math.round(delay / 1000 / 60)} minutos`);

      const timeoutId = setTimeout(() => {
        showNotification(title, { 
          body,
          tag: notificationId,
          requireInteraction: true,
        });
        scheduledTimeouts.current.delete(notificationId);
      }, delay);

      scheduledTimeouts.current.set(notificationId, timeoutId);
      return timeoutId;
    },
    [showNotification]
  );

  const cancelScheduledNotification = useCallback((id: string) => {
    const timeout = scheduledTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      scheduledTimeouts.current.delete(id);
      console.log("[Notifications] Notificação cancelada:", id);
      return true;
    }
    return false;
  }, []);

  const cancelAllScheduledNotifications = useCallback(() => {
    scheduledTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    scheduledTimeouts.current.clear();
    console.log("[Notifications] Todas as notificações agendadas foram canceladas");
  }, []);

  return {
    permission,
    isSupported,
    swRegistration,
    requestPermission,
    showNotification,
    scheduleLocalNotification,
    cancelScheduledNotification,
    cancelAllScheduledNotifications,
  };
};
