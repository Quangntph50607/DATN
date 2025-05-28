// src/components/ui/button-types.ts
import { ButtonHTMLAttributes } from "react";
import { MotionProps } from "framer-motion";

type ButtonBaseProps = ButtonHTMLAttributes<HTMLButtonElement> & MotionProps;

export type ButtonVariant = 
  | "default" 
  | "lego-primary"
  | "lego-accent"
  | "lego-destructive"
  | "outline"
  | "ghost";

export type ButtonSize = "sm" | "default" | "lg" | "xl";

export interface ButtonProps extends Omit<ButtonBaseProps, 'onAnimationStart'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  brickEffect?: boolean;
  shadowColor?: string;
} 