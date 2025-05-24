"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

type LoadingButtonProps = {
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline";
};

export function LoadingButton({
  isLoading,
  disabled,
  children,
  className = "",
  variant = "default",
}: LoadingButtonProps) {
  return (
    <motion.div
      whileHover={!isLoading ? { scale: 1.03 } : {}}
      whileTap={!isLoading ? { scale: 0.97 } : {}}
      className="relative w-full"
    >
      <Button
        disabled={isLoading || disabled}
        type="submit"
        variant={variant}
        className={`relative overflow-hidden transition-opacity ${
          isLoading ? "opacity-80 cursor-wait" : ""
        } ${className}`}
      >
        {/* Dải ánh sáng chạy ngang */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-white/20 pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {/* Nội dung nút */}
        <span className="flex items-center gap-2 z-10">
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          {children}
        </span>
      </Button>
    </motion.div>
  );
}
