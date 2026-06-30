import { ReactNode, useState } from "react";
import { Pressable, PressableProps, StyleProp, Text, TextInput, TextInputProps, View, ViewProps, ViewStyle } from "react-native";
import { colors, helpers } from "@/theme";
import { styles } from "./styles";

export function Card({ children, elevated, style }: ViewProps & { elevated?: boolean }) {
  return <View style={[elevated ? styles.elevatedCard : styles.card, style]}>{children}</View>;
}

export function Button({ children, variant = "primary", style, textStyle, ...props }: Omit<PressableProps, "style"> & { children: ReactNode; variant?: "primary" | "secondary" | "danger"; style?: StyleProp<ViewStyle>; textStyle?: object }) {
  const buttonStyle = variant === "primary" ? styles.button : variant === "danger" ? styles.dangerButton : styles.secondaryButton;
  const labelStyle = variant === "primary" ? styles.buttonText : variant === "danger" ? styles.dangerText : styles.secondaryText;
  return <Pressable {...props} style={({ pressed }) => [buttonStyle, pressed && { opacity: 0.78, transform: [{ scale: 0.99 }] }, style]}><Text style={[labelStyle, textStyle]}>{children}</Text></Pressable>;
}

export function Input(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return <TextInput placeholderTextColor={colors.textMuted} {...props} onFocus={(e) => { setFocused(true); props.onFocus?.(e); }} onBlur={(e) => { setFocused(false); props.onBlur?.(e); }} style={[helpers.input, focused && helpers.inputFocused, props.style]} />;
}

export function Badge({ children, tone = "neon" }: { children: ReactNode; tone?: "neon" | "muted" | "success" | "warning" | "blue" | "danger" }) {
  const toneStyle = tone === "neon" ? styles.badge : [styles.badgeMuted, tone === "success" && { color: colors.success, borderColor: colors.success }, tone === "warning" && { color: colors.warning, borderColor: colors.warning }, tone === "blue" && { color: colors.blue, borderColor: colors.blue }, tone === "danger" && { color: colors.danger, borderColor: colors.danger }];
  return <Text style={toneStyle}>{children}</Text>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <Card elevated style={{ alignItems: "center", marginTop: 24 }}><Text style={styles.subtitle}>{title}</Text><Text style={[styles.muted, { textAlign: "center", marginBottom: 12 }]}>{body}</Text>{action}</Card>;
}
