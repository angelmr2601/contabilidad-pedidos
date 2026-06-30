import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "@/theme";
import { getSession } from "@/lib/auth";
import { styles } from "@/components/styles";
export default function Index() {
  useEffect(() => { getSession().then((s) => router.replace(s ? "/pedidos" : "/login")).catch(() => router.replace("/login")); }, []);
  return <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}><Text style={styles.eyebrow}>Offside Club</Text><ActivityIndicator color={colors.neon} size="large" /><Text style={[styles.muted, { marginTop: 12 }]}>Preparando control operativo...</Text></View>;
}
