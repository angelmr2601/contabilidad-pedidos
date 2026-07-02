import { ReactNode, useState } from "react";
import { Pressable, PressableProps, StyleProp, Text, TextInput, TextInputProps, View, ViewProps, ViewStyle } from "react-native";
import { router, usePathname } from "expo-router";
import { colors, helpers } from "@/theme";
import { styles } from "./styles";

type ButtonVariant = "primary" | "secondary" | "danger";

type TabItem = { label: string; href: string; match: string; icon: string };
const tabs: TabItem[] = [
  { label: "Pedidos", href: "/pedidos", match: "/pedidos", icon: "⌁" },
  { label: "Resumen", href: "/resumen", match: "/resumen", icon: "▦" },
  { label: "Borrador", href: "/borrador", match: "/borrador", icon: "+" },
  { label: "Ajustes", href: "/configuracion", match: "/configuracion", icon: "⚙" },
];

export function Card({ children, elevated, style }: ViewProps & { elevated?: boolean }) {
  return <View style={[elevated ? styles.elevatedCard : styles.card, style]}>{children}</View>;
}

export function Button({ children, variant = "primary", style, textStyle, ...props }: Omit<PressableProps, "style"> & { children: ReactNode; variant?: ButtonVariant; style?: StyleProp<ViewStyle>; textStyle?: object }) {
  const buttonStyle = variant === "primary" ? styles.button : variant === "danger" ? styles.dangerButton : styles.secondaryButton;
  const labelStyle = variant === "primary" ? styles.buttonText : variant === "danger" ? styles.dangerText : styles.secondaryText;
  return <Pressable {...props} style={({ pressed }) => [buttonStyle, props.disabled && { opacity: 0.5 }, pressed && !props.disabled && { opacity: 0.78, transform: [{ scale: 0.99 }] }, style]}><Text style={[labelStyle, textStyle]}>{children}</Text></Pressable>;
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

export function AppHeader({ eyebrow = "Offside Club", title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <View style={styles.appHeader}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}</View>{action}</View>;
}

export function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: { label: string; value: T }[]; onChange: (value: T) => void }) {
  return <View style={styles.segmented}>{options.map((option) => <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.segment, value === option.value && styles.segmentActive]}><Text style={[styles.segmentText, value === option.value && styles.segmentTextActive]}>{option.label}</Text></Pressable>)}</View>;
}

export function BottomNav() {
  const pathname = usePathname();
  return <View style={styles.bottomNav}>{tabs.map((tab) => {
    const active = pathname === tab.match || pathname.startsWith(`${tab.match}/`);
    return <Pressable key={tab.href} onPress={() => router.replace(tab.href as never)} style={styles.bottomNavItem}><Text style={[styles.bottomNavIcon, active && styles.bottomNavActive]}>{tab.icon}</Text><Text style={[styles.bottomNavLabel, active && styles.bottomNavActive]}>{tab.label}</Text></Pressable>;
  })}</View>;
}
