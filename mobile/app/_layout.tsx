import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { colors } from "@/theme";
import { supabase } from "@/lib/supabase";
export default function RootLayout() {
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.neon, headerTitleStyle: { color: colors.text, fontWeight: "900" }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }} />;
}
