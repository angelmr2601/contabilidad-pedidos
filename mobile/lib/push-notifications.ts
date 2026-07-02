import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";

const API_URL = process.env.EXPO_PUBLIC_APP_API_URL;

export async function setupTrackingNotifications(session: Session | null) {
  try {
    if (!session || !Device.isDevice || !API_URL) return;
    if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("tracking", { name: "tracking", importance: Notifications.AndroidImportance.HIGH, sound: "default" });
    const existing = await Notifications.getPermissionsAsync();
    const finalStatus = existing.granted ? existing.status : (await Notifications.requestPermissionsAsync()).status;
    if (finalStatus !== "granted") return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const expoPushToken = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    await fetch(`${API_URL}/api/push/register`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ expoPushToken, platform: Platform.OS, deviceName: Device.deviceName }) });
  } catch (error) { console.warn("No se pudo registrar el token push", error); }
}

export function listenTrackingNotificationResponses() {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as { pedidoId?: string; type?: string };
    if (data.type === "tracking_update" && data.pedidoId) router.push(`/pedidos/${data.pedidoId}` as never);
  });
}
