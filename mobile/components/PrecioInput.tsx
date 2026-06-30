import { Text, View } from "react-native";
import { Input } from "./ui";
import { styles } from "./styles";
export function PrecioInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <View style={styles.card}><Text style={styles.label}>{label}</Text><Input keyboardType="decimal-pad" value={String(value)} onChangeText={(text) => onChange(Number(text.replace(",", ".")) || 0)} /></View>;
}
