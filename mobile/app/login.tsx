import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { signInWithPassword } from "@/lib/auth";
import { styles } from "@/components/styles";
export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function login() { setLoading(true); setError(""); try { await signInWithPassword(email, password); router.replace("/pedidos"); } catch (e) { setError(e instanceof Error ? e.message : "No se pudo iniciar sesión"); } finally { setLoading(false); } }
  return <View style={[styles.screen, { justifyContent: "center" }]}><Text style={styles.title}>Offside Club</Text><TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} /><TextInput style={styles.input} secureTextEntry placeholder="Contraseña" value={password} onChangeText={setPassword} />{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable style={styles.button} onPress={login} disabled={loading}><Text style={styles.buttonText}>{loading ? "Entrando..." : "Iniciar sesión"}</Text></Pressable></View>;
}
