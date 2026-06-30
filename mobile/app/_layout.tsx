import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
export default function RootLayout() {
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <Stack screenOptions={{ headerStyle: { backgroundColor: "#111827" }, headerTintColor: "#fff" }} />;
}
