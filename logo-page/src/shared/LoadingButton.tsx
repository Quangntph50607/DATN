"use client";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { motion } from "framer-motion";

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
  className,
  variant = "default",
}: LoadingButtonProps) {
  return (
    <motion.div
      whileHover={!isLoading ? { scale: 1.02 } : {}}
      whileTap={!isLoading ? { scale: 0.98 } : {}}
    >
      <Button
        className={`relative overflow-hidden ${className}`}
        disabled={isLoading || disabled}
        type="submit"
        variant={variant}
      >
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-primary/20"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <div className="flex items-center gap-2 z-10">
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          {children}
        </div>
      </Button>
    </motion.div>
  );
}
