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
};

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon: Icon, id, placeholder, type, className, ...field }, ref) => {
    return (
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 items-center flex ">
          <Icon />
        </span>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`h-12 text-white italic pl-10 ${className}`}
          {...field}
          ref={ref}
        />
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";
