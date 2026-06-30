import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  title: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 12 },
  subtitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  text: { color: "#374151", marginBottom: 4 },
  muted: { color: "#6b7280" },
  input: { backgroundColor: "#fff", borderColor: "#d1d5db", borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" },
  button: { backgroundColor: "#111827", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", marginVertical: 4 },
  secondaryButton: { backgroundColor: "#e5e7eb", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", marginVertical: 4 },
  dangerButton: { backgroundColor: "#991b1b", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", marginVertical: 4 },
  buttonText: { color: "#fff", fontWeight: "700" },
  secondaryText: { color: "#111827", fontWeight: "700" },
  badge: { backgroundColor: "#dcfce7", color: "#166534", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, overflow: "hidden", fontWeight: "700" },
  error: { color: "#b91c1c", marginBottom: 8 },
});
