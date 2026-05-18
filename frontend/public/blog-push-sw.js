// Phase BA — Web Push Service Worker untuk Blog Platform myUnila.
//
// Registered di /dashboard/blog-platform/notifications saat user enable push.
// Scope: /dashboard/blog-platform/* (didapat dari registration scope).
//
// Push events di-handle dengan showNotification + click → focus/open URL
// dari payload.url (set di backend apps/push/bridge.go).

/* eslint-disable no-undef */

self.addEventListener("install", (event) => {
  // Activate immediately tanpa nunggu old SW close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take over open clients (tab dashboard yang sedang open).
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Blog Unila", body: event.data.text() };
  }

  const title = payload.title || "Blog Unila";
  const options = {
    body: payload.body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    tag: payload.tipe || "blog-unila",  // group similar notifications
    data: {
      url: payload.url || "/dashboard/blog-platform/notifications",
      id_notif: payload.id_notif || null,
      tipe: payload.tipe || null,
    },
    // Re-trigger sound + vibration kalau user lihat notif baru dari tipe sama.
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/dashboard/blog-platform/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Kalau dashboard sudah open di tab → focus + navigate.
      for (const client of clients) {
        if (client.url.includes("/dashboard/blog-platform") && "focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      // Else open new tab.
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
    })
  );
});

// pushsubscriptionchange fires when push service rotates subscription
// (browser-initiated, biasanya saat user clear data atau expire). Frontend
// app side handles re-subscribe; SW cuma log untuk diagnostics.
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[blog-push-sw] pushsubscriptionchange — frontend should re-subscribe");
});
