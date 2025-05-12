"use client";

import { Eye, EyeOff } from "lucide-react";

type PasswordToggleProps = {
  showPassword: boolean;
  toggleShowPassword: () => void;
  className?: string;
};

export function PasswordToggle({
  showPassword,
  toggleShowPassword,
  className,
}: PasswordToggleProps) {
  return (
    <span
      className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${className}`}
      onClick={toggleShowPassword}
      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5 text-gray-500" />
      ) : (
        <Eye className="h-5 w-5 text-gray-500" />
      )}
    </span>
  );
}
