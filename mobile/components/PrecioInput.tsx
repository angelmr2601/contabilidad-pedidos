import { Text, TextInput, View } from "react-native";
import { styles } from "./styles";
export function PrecioInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <View><Text style={styles.text}>{label}</Text><TextInput style={styles.input} keyboardType="decimal-pad" value={String(value)} onChangeText={(text) => onChange(Number(text.replace(",", ".")) || 0)} /></View>;
}
