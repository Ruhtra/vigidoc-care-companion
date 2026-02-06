// Custom Service Worker for VigiDoc Push Notifications
// This SW runs independently of the app and checks reminders even when the app is closed.

const DB_NAME = "vigidoc-reminders-db";
const DB_VERSION = 1;
const STORE_NAME = "reminders";
const CHECK_INTERVAL_MS = 15 * 1000; // Check every 15 seconds for due reminders

// ─── IndexedDB helpers ───────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllReminders() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function saveReminder(reminder) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(reminder);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function deleteReminderFromDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function clearAllReminders() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function updateLastFired(id, timestamp) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const reminder = getReq.result;
      if (reminder) {
        reminder.lastFired = timestamp;
        store.put(reminder);
      }
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// ─── Core notification check logic ──────────────────────────────────

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

async function checkAndFireReminders() {
  try {
    const reminders = await getAllReminders();
    const now = new Date();
    const currentDayIndex = now.getDay();
    // Support both accented and non-accented day names
    const currentDay = DAY_NAMES[currentDayIndex];
    const todayKey = getTodayKey();

    for (const reminder of reminders) {
      if (!reminder.enabled) continue;

      // Check if today is one of the scheduled days
      const matchesDay = reminder.days.some(
        (d) =>
          d === currentDay ||
          d.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === currentDay
      );
      if (!matchesDay) continue;

      const [hours, minutes] = reminder.time.split(":").map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Fire if we are within a 60-second window of the scheduled time
      const diffMs = now.getTime() - scheduledTime.getTime();
      if (diffMs >= 0 && diffMs < 60000) {
        // Check if already fired today for this reminder (prevent duplicate)
        const firedKey = `${reminder.id}_${todayKey}_${reminder.time}`;
        if (reminder.lastFired === firedKey) continue;

        // Fire the notification
        await self.registration.showNotification("VigiDoc - Lembrete", {
          body: reminder.label,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          vibrate: [200, 100, 200, 100, 200],
          tag: `vigidoc-reminder-${reminder.id}`,
          data: {
            reminderId: reminder.id,
            url: "/lembretes",
          },
          actions: [
            { action: "open", title: "Abrir" },
            { action: "close", title: "Fechar" },
          ],
          requireInteraction: true,
          renotify: true,
        });

        // Mark as fired so we don't fire again today for this time
        await updateLastFired(reminder.id, firedKey);

        console.log(
          `[SW] Notificacao disparada: "${reminder.label}" as ${reminder.time}`
        );
      }
    }
  } catch (error) {
    console.error("[SW] Erro ao verificar lembretes:", error);
  }
}

// ─── Periodic check using setInterval inside the SW ─────────────────

let checkIntervalId = null;

function startPeriodicCheck() {
  if (checkIntervalId) return; // Already running
  checkIntervalId = setInterval(() => {
    checkAndFireReminders();
  }, CHECK_INTERVAL_MS);
  console.log("[SW] Verificacao periodica iniciada (a cada 15s)");
  // Also fire an immediate check
  checkAndFireReminders();
}

function stopPeriodicCheck() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
}

// ─── SW Lifecycle Events ────────────────────────────────────────────

self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker instalado");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker ativado");
  event.waitUntil(
    (async () => {
      await clients.claim();
      startPeriodicCheck();
    })()
  );
});

// ─── Message handler (communication with the app) ───────────────────

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case "SYNC_REMINDERS":
      // The app sends the full list of reminders; we replace them all in IndexedDB
      event.waitUntil(
        (async () => {
          try {
            await clearAllReminders();
            if (Array.isArray(payload)) {
              for (const reminder of payload) {
                await saveReminder(reminder);
              }
            }
            console.log(
              `[SW] ${(payload || []).length} lembretes sincronizados`
            );
            // Restart checking
            startPeriodicCheck();
            // Reply to the app
            if (event.ports && event.ports[0]) {
              event.ports[0].postMessage({ success: true });
            }
          } catch (err) {
            console.error("[SW] Erro ao sincronizar lembretes:", err);
            if (event.ports && event.ports[0]) {
              event.ports[0].postMessage({
                success: false,
                error: err.message,
              });
            }
          }
        })()
      );
      break;

    case "ADD_REMINDER":
      event.waitUntil(
        (async () => {
          try {
            await saveReminder(payload);
            startPeriodicCheck();
            console.log(`[SW] Lembrete adicionado: ${payload.label}`);
          } catch (err) {
            console.error("[SW] Erro ao adicionar lembrete:", err);
          }
        })()
      );
      break;

    case "DELETE_REMINDER":
      event.waitUntil(
        (async () => {
          try {
            await deleteReminderFromDB(payload.id);
            console.log(`[SW] Lembrete removido: ${payload.id}`);
          } catch (err) {
            console.error("[SW] Erro ao remover lembrete:", err);
          }
        })()
      );
      break;

    case "UPDATE_REMINDER":
      event.waitUntil(
        (async () => {
          try {
            await saveReminder(payload);
            console.log(`[SW] Lembrete atualizado: ${payload.id}`);
          } catch (err) {
            console.error("[SW] Erro ao atualizar lembrete:", err);
          }
        })()
      );
      break;

    case "TEST_NOTIFICATION":
      event.waitUntil(
        self.registration.showNotification("VigiDoc - Teste", {
          body: payload?.body || "Notificacoes funcionando!",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          vibrate: [200, 100, 200],
          tag: "vigidoc-test",
          requireInteraction: false,
        })
      );
      break;

    case "PING":
      // Keep-alive ping from the app to prevent SW from going idle
      startPeriodicCheck();
      break;

    default:
      console.log("[SW] Mensagem desconhecida:", type);
  }
});

// ─── Push notifications (for future server push support) ────────────

self.addEventListener("push", (event) => {
  console.log("[SW] Push recebido:", event);

  let data = {
    title: "VigiDoc",
    body: "Voce tem um novo lembrete!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    vibrate: [200, 100, 200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || "/",
    },
    actions: [
      { action: "open", title: "Abrir" },
      { action: "close", title: "Fechar" },
    ],
    requireInteraction: true,
    tag: data.tag || "vigidoc-notification",
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ─── Notification click ─────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notificacao clicada:", event);
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ─── Background Sync ────────────────────────────────────────────────

self.addEventListener("sync", (event) => {
  console.log("[SW] Sync event:", event.tag);
  if (event.tag === "check-reminders") {
    event.waitUntil(checkAndFireReminders());
  }
});

// ─── Periodic Background Sync (for browsers that support it) ────────

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-reminders") {
    console.log("[SW] Periodic sync: check-reminders");
    event.waitUntil(checkAndFireReminders());
  }
});

// Start checking on SW load (e.g. after browser restart)
startPeriodicCheck();
