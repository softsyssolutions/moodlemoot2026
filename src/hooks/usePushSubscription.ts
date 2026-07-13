import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY, isPreviewOrIframe, urlBase64ToUint8Array } from "@/lib/pushConfig";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushSubscription() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);
    setIsPreview(isPreviewOrIframe());

    if (!supported) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);

    // Comprobar suscripción existente
    if (!isPreviewOrIframe()) {
      navigator.serviceWorker.getRegistration().then(async (reg) => {
        if (!reg) return;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      });
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) throw new Error("Tu navegador no soporta notificaciones push.");
    if (isPreview) {
      throw new Error(
        "Las notificaciones solo funcionan en el sitio publicado (moodlemootperu.com), no en la vista previa."
      );
    }
    setLoading(true);
    try {
      // Registrar SW
      const reg =
        (await navigator.serviceWorker.getRegistration("/service-worker.js")) ||
        (await navigator.serviceWorker.register("/service-worker.js"));
      await navigator.serviceWorker.ready;

      // Pedir permiso
      const perm = await Notification.requestPermission();
      setPermission(perm as PermissionState);
      if (perm !== "granted") throw new Error("Permiso de notificaciones denegado.");

      // Suscribirse
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        }));

      const json = sub.toJSON();
      const { error } = await supabase.functions.invoke("save-push-subscription", {
        body: {
          endpoint: json.endpoint,
          keys: json.keys,
          user_agent: navigator.userAgent,
          locale: navigator.language,
        },
      });
      if (error) throw error;
      setIsSubscribed(true);
      return true;
    } finally {
      setLoading(false);
    }
  }, [isSupported, isPreview]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || isPreview) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [isSupported, isPreview]);

  return { isSupported, isPreview, permission, isSubscribed, loading, subscribe, unsubscribe };
}
