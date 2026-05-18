/**
 * Push Service — web push notification subscription management (Phase BA).
 *
 * Flow:
 *   1. checkSupport()                     → cek browser kapabilitas
 *   2. getPermission() / requestPermission() → grant flow
 *   3. fetchPublicKey()                   → VAPID dari backend
 *   4. ensureServiceWorker()              → register /blog-push-sw.js
 *   5. subscribe() / unsubscribe()        → POST/DELETE backend
 *
 * Karena service worker harus served dari same origin di scope yang cocok,
 * kita serve dari /public/blog-push-sw.js (frontend Next.js).
 */
import { blogClient, type APIEnvelope } from "./blogClient";

const SW_PATH = "/blog-push-sw.js";
const SW_SCOPE = "/dashboard/blog-platform/";

export interface PushSubscriptionRow {
  id_subscription: string;
  endpoint: string;
  user_agent?: string | null;
  created_at: string;
  last_used_at?: string | null;
  last_error?: string | null;
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function pushPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  return Notification.permission;
}

async function getOrRegisterSW(): Promise<ServiceWorkerRegistration> {
  // Cek existing registration di scope dulu. Hindari re-register di setiap
  // panggilan (Browser cache & dedupe sudah, tapi safer).
  const existing = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  if (existing) return existing;
  return navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE });
}

// Convert URL-safe base64 (VAPID format) → Uint8Array (PushManager.subscribe input).
function urlBase64ToUint8(b64: string): Uint8Array {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// ArrayBuffer → base64url. Browser-side helper: keys di PushSubscriptionJSON
// sudah base64url, tapi raw getKey() returns ArrayBuffer — kita pakai .toJSON()
// supaya gak perlu hand-encode.

export const pushService = {
  async fetchPublicKey(): Promise<string> {
    const { data } = await blogClient.get<APIEnvelope<{ public_key: string }>>(
      "/push/vapid-public",
    );
    return data.data.public_key;
  },

  async list(): Promise<PushSubscriptionRow[]> {
    const { data } = await blogClient.get<APIEnvelope<PushSubscriptionRow[]>>(
      "/me/notifications/push/",
    );
    return data.data ?? [];
  },

  // Subscribe end-to-end: register SW → request permission → push subscribe → POST backend.
  // Returns null kalau user deny atau browser tidak support.
  async subscribe(): Promise<PushSubscriptionRow | null> {
    if (!isPushSupported()) throw new Error("Browser tidak support web push");

    // 1. Request permission (idempotent kalau sudah granted)
    if (Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return null;
    }

    // 2. Ambil VAPID public key dari backend
    const publicKey = await this.fetchPublicKey();
    if (!publicKey) throw new Error("Web push belum di-config di server");

    // 3. Register SW + subscribe ke PushManager
    const reg = await getOrRegisterSW();
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      // TS lib.dom marks applicationServerKey as BufferSource — Uint8Array fits at runtime.
      const appKey = urlBase64ToUint8(publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appKey.buffer as ArrayBuffer,
      });
    }

    // 4. Kirim ke backend (idempotent — backend UPSERT)
    const sub = subscription.toJSON() as {
      endpoint: string;
      keys?: { p256dh?: string; auth?: string };
    };
    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      throw new Error("PushSubscription incomplete");
    }
    const { data } = await blogClient.post<APIEnvelope<PushSubscriptionRow>>(
      "/me/notifications/push/subscribe",
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        user_agent: navigator.userAgent.slice(0, 255),
      },
    );
    return data.data;
  },

  // Unsubscribe local + remote. Idempotent.
  async unsubscribe(): Promise<void> {
    if (!isPushSupported()) return;
    const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    if (!reg) return;
    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) return;
    const endpoint = subscription.endpoint;
    try {
      await subscription.unsubscribe();
    } catch {
      // ignore
    }
    try {
      await blogClient.delete("/me/notifications/push/subscribe", {
        data: { endpoint },
      });
    } catch {
      // ignore — kalau row sudah ke-delete server-side (410 cleanup), fine.
    }
  },

  async unsubscribeByID(id: string): Promise<void> {
    await blogClient.delete(`/me/notifications/push/${id}`);
  },

  async testSend(): Promise<{ sent: number; deleted_stale: number }> {
    const { data } = await blogClient.post<APIEnvelope<{ sent: number; deleted_stale: number }>>(
      "/me/notifications/push/test",
    );
    return data.data;
  },
};
