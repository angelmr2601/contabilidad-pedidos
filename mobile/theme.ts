import { Platform, StyleSheet } from "react-native";

export const colors = {
  background: "#050505",
  surface: "#101010",
  surfaceElevated: "#171717",
  surfaceSoft: "#1F1F1F",
  border: "#2A2A2A",
  borderStrong: "#3A3A3A",
  text: "#F5F5F5",
  textMuted: "#A3A3A3",
  textSoft: "#D4D4D4",
  neon: "#B6FF00",
  neonDark: "#6FA800",
  success: "#38D46A",
  warning: "#FFCC00",
  danger: "#FF4D4D",
  blue: "#4DA3FF",
  black: "#000000",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 };

export const shadows = StyleSheet.create({
  card: {
    shadowColor: colors.neon,
    shadowOpacity: Platform.OS === "ios" ? 0.12 : 0,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
});

export const typography = StyleSheet.create({
  eyebrow: { color: colors.neon, fontSize: 11, fontWeight: "900", letterSpacing: 1.6, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 30, fontWeight: "900", letterSpacing: -0.8 },
  h2: { color: colors.text, fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  body: { color: colors.textSoft, fontSize: 15, lineHeight: 21 },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
});

export const helpers = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  cardElevated: { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: radius.xl, padding: spacing.xl },
  input: { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: radius.md, color: colors.text, paddingHorizontal: spacing.lg, paddingVertical: 13, fontSize: 16 },
  inputFocused: { borderColor: colors.neon },
  primaryButton: { backgroundColor: colors.neon, borderColor: colors.neon, borderWidth: 1, borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: spacing.lg, alignItems: "center", justifyContent: "center" },
  secondaryButton: { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.lg, alignItems: "center", justifyContent: "center" },
  dangerButton: { backgroundColor: "rgba(255,77,77,0.12)", borderColor: colors.danger, borderWidth: 1, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.lg, alignItems: "center", justifyContent: "center" },
});
