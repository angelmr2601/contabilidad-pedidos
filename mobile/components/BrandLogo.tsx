import { Image, ImageStyle, StyleProp } from "react-native";

export const logoLight = require("../assets/brand/logo-light.png");
export const logoDark = require("../assets/brand/logo-dark.png");

type BrandLogoProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ImageStyle>;
};

const logoSizes: Record<NonNullable<BrandLogoProps["size"]>, ImageStyle> = {
  sm: { width: 96, height: 40 },
  md: { width: 148, height: 62 },
  lg: { width: 210, height: 88 },
};

export function BrandLogo({ variant = "dark", size = "md", style }: BrandLogoProps) {
  return <Image source={variant === "light" ? logoLight : logoDark} resizeMode="contain" style={[logoSizes[size], style]} />;
}
