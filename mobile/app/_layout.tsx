import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { colors } from "@/theme";
import { supabase } from "@/lib/supabase";
import { listenTrackingNotificationResponses, setupTrackingNotifications } from "@/lib/push-notifications";

export default function RootLayout() {
  useEffect(() => {
    let notificationSubscription: { remove(): void } = { remove: () => undefined };
    let mounted = true;
    listenTrackingNotificationResponses().then((subscription) => {
      if (mounted) notificationSubscription = subscription;
      else subscription.remove();
    }).catch(() => undefined);
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
      else setupTrackingNotifications(session).catch(() => undefined);
    });
    return () => { mounted = false; notificationSubscription.remove(); data.subscription.unsubscribe(); };
  }, []);

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="index" options={{ title: "Offside Club" }} />
    <Stack.Screen name="login" options={{ title: "Entrar" }} />
    <Stack.Screen name="pedidos/index" options={{ title: "Pedidos" }} />
    <Stack.Screen name="pedidos/[id]" options={{ title: "Detalle del pedido" }} />
    <Stack.Screen name="resumen" options={{ title: "Resumen" }} />
    <Stack.Screen name="borrador" options={{ title: "Borrador" }} />
    <Stack.Screen name="configuracion" options={{ title: "Ajustes" }} />
  </Stack>;
}
