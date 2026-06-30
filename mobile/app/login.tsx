import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { signInWithPassword } from "@/lib/auth";
import { Button, Card, Input } from "@/components/ui";
import { styles } from "@/components/styles";
import { colors } from "@/theme";
export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function login() { setLoading(true); setError(""); try { await signInWithPassword(email, password); router.replace("/pedidos"); } catch (e) { setError(e instanceof Error ? e.message : "No se pudo iniciar sesión"); } finally { setLoading(false); } }
  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[styles.screen, { justifyContent: "center" }]}>
    <Card elevated>
      <View style={{ alignItems: "center", marginBottom: 24 }}><View style={{ width: 82, height: 82, borderRadius: 24, borderWidth: 1, borderColor: colors.neon, alignItems: "center", justifyContent: "center", backgroundColor: colors.black }}><Text style={{ color: colors.neon, fontSize: 32, fontWeight: "900" }}>OC</Text></View></View>
      <Text style={styles.eyebrow}>Panel de pedidos</Text><Text style={styles.title}>Offside Club</Text><Text style={[styles.text, { marginBottom: 20 }]}>Gestiona tus pedidos, pagos y entregas con control premium.</Text>
      <Text style={styles.label}>Email</Text><Input autoCapitalize="none" keyboardType="email-address" placeholder="correo@offside.club" value={email} onChangeText={setEmail} />
      <Text style={styles.label}>Contraseña</Text><Input secureTextEntry placeholder="Tu contraseña" value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}<Button onPress={login} disabled={loading}>{loading ? "Entrando..." : "Iniciar sesión"}</Button>
      <Text style={[styles.muted, { marginTop: 14, textAlign: "center" }]}>En buenas manos. Acceso seguro con Supabase Auth.</Text>
    </Card>
  </KeyboardAvoidingView>;
}
