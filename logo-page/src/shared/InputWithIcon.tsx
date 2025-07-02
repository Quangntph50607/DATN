"use client";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";
import React, { forwardRef } from "react";

type InputWithIconProps = {
  icon: LucideIcon;
  id: string;
  placeholder: string;
  type: string;
  className?: string;
  field?: Partial<React.InputHTMLAttributes<HTMLInputElement>>;
  autoComplete?: string;
};

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  (
    { icon: Icon, id, placeholder, type, className, autoComplete, ...field },
    ref
  ) => {
    return (
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 items-center flex ">
          <Icon className="text-black" />
        </span>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`h-12 text-black shadow-sm focus:ring-2 focus:ring-yellow-600 border-gray-800 gap-3 italic pl-10 ${className}`}
          autoComplete={autoComplete}
          {...field}
          // style={{
          //   WebkitBoxShadow: "0 0 0 1000px white inset",
          //   WebkitTextFillColor: "black",
          // }}
          ref={ref}
        />
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";
