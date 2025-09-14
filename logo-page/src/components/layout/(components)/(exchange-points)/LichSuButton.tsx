"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface LichSuButtonProps {
  onClick: () => void;
  count?: number;
}

export const LichSuButton: React.FC<LichSuButtonProps> = ({ onClick, count = 0 }) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors"
    >
      <History className="h-4 w-4 mr-2" />
      Lịch Sử Đổi Điểm
      {count > 0 && (
        <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </Button>
  );
};
