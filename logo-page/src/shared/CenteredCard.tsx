"use client";

import { Card } from "@/components/ui/card";

type CenteredCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function CenteredCard({ children, className }: CenteredCardProps) {
  return (
    <Card className={`max-w-md mx-auto mt-10 p-6 shadow-lg ${className}`}>
      {children}
    </Card>
  );
}
