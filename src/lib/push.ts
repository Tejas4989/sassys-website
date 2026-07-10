import webpush from "web-push";

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

let vapidReady = false;

/**
 * Configure VAPID lazily on first send. Doing this at module load throws during
 * the build (and cold-starts without secrets) because `setVapidDetails`
 * validates the key eagerly. Returns false if keys aren't configured.
 */
function ensureVapid(): boolean {
  if (vapidReady) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails("mailto:inquiry@mysassys.com", publicKey, privateKey);
  vapidReady = true;
  return true;
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: { title: string; body: string; url?: string }
) {
  if (!ensureVapid()) return false;
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch {
    // Subscription may be expired/invalid — caller should remove it from DB
    return false;
  }
}
