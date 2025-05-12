"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import React from "react";

type SocialButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "google" | "facebook";
};

export default function SocialButton({
  icon: Icon,
  label,
  onClick,
  className,
  variant = "default",
}: SocialButtonProps) {
  const variantClasses = {
    google: "bg-white text-gray-800 hover:bg-gray-100 border border-gray-300",
    facebook: "bg-[#1877F2] text-white hover:bg-[#166FE5]",
    default: "",
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        className={`w-full flex items-center gap-3 justify-center transition-all ${variantClasses[variant]} ${className}`}
        onClick={onClick}
        variant={variant === "default" ? "default" : "outline"}
      >
        <Icon
          className={`w-5 h-5 ${variant === "google" ? "text-[#EA4335]" : ""}`}
        />
        <span className="font-medium">{label}</span>
      </Button>
    </motion.div>
  );
}
