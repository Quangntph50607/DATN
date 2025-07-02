"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type FormFieldWrapperProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function FormFieldWrapper({
  label,
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <FormItem className={className}>
      <FormLabel className="text-black font-bold text-xl">{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage className="font-semibold " />
    </FormItem>
  );
}
