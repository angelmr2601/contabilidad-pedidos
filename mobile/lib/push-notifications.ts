import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";

const API_URL = process.env.EXPO_PUBLIC_APP_API_URL;
const noopSubscription = { remove: () => undefined };

export function isExpoGo() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export async function setupTrackingNotifications(session: Session | null) {
  try {
    if (isExpoGo()) {
      console.info("Push notifications disabled in Expo Go");
      return { supported: false as const, reason: "expo-go" as const };
    }
    if (!session || !Device.isDevice || !API_URL) return { supported: false as const, reason: "missing-session-device-or-api-url" as const };
    if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("tracking", { name: "tracking", importance: Notifications.AndroidImportance.HIGH, sound: "default" });
    const existing = await Notifications.getPermissionsAsync();
    const finalStatus = existing.granted ? existing.status : (await Notifications.requestPermissionsAsync()).status;
    if (finalStatus !== "granted") return { supported: false as const, reason: "permission-denied" as const };
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const expoPushToken = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    await fetch(`${API_URL}/api/push/register`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ expoPushToken, platform: Platform.OS, deviceName: Device.deviceName }) });
    return { supported: true as const, expoPushToken };
  } catch (error) {
    console.warn("No se pudo registrar el token push", error);
    return { supported: false as const, reason: "registration-error" as const };
  }
}

export function listenTrackingNotificationResponses() {
  if (isExpoGo()) return noopSubscription;
  try {
    return Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { pedidoId?: string; type?: string };
      if (data.type === "tracking_update" && data.pedidoId) router.push(`/pedidos/${data.pedidoId}` as never);
    });
  } catch (error) {
    console.warn("No se pudo escuchar respuestas de notificaciones", error);
    return noopSubscription;
  }
}
