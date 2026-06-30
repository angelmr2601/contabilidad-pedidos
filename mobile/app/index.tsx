import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { getSession } from "@/lib/auth";
export default function Index() {
  useEffect(() => { getSession().then((s) => router.replace(s ? "/pedidos" : "/login")).catch(() => router.replace("/login")); }, []);
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></View>;
}
