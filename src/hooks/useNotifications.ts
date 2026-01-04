import { useState, useEffect, useCallback } from "react";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log("Notifications not supported");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== "granted") {
        console.log("Cannot show notification - permission not granted");
        return;
      }

      try {
        // Try to use service worker for better PWA support
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          ...options,
        });
      } catch (error) {
        // Fallback to regular notification
        new Notification(title, {
          icon: "/icon-192.png",
          ...options,
        });
      }
    },
    [isSupported, permission]
  );

  const scheduleLocalNotification = useCallback(
    (title: string, body: string, scheduledTime: Date) => {
      const now = new Date();
      const delay = scheduledTime.getTime() - now.getTime();

      if (delay <= 0) {
        console.log("Scheduled time is in the past");
        return null;
      }

      const timeoutId = setTimeout(() => {
        showNotification(title, { body });
      }, delay);

      return timeoutId;
    },
    [showNotification]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleLocalNotification,
  };
};
