"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthCard({ title, children, className }: AuthCardProps) {
  return (
    <Card className={`max-w-sm mx-auto mt-5 p-6 shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className="font-bold text-4xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
