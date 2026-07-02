import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { BrandLogo } from "@/components/BrandLogo";
import { colors } from "@/theme";
import { getSession } from "@/lib/auth";
import { styles } from "@/components/styles";
export default function Index() {
  useEffect(() => { getSession().then((s) => router.replace(s ? "/pedidos" : "/login")).catch(() => router.replace("/login")); }, []);
  return <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}><BrandLogo variant="dark" size="md" style={{ marginBottom: 18 }} /><ActivityIndicator color={colors.neon} size="large" /><Text style={[styles.muted, { marginTop: 12 }]}>Preparando control operativo...</Text></View>;
}
