"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  // statusInfo?: {
  //   currentStatus: string;
  //   newStatus: string;
  //   productName: string;
  //   quantity: number;
  //   price: string;
  // };
};

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
}: // statusInfo,
ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-white text-gray-800 rounded-xl shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-blue-600">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            onClick={onCancel}
            className="border border-gray-500 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md"
          >
            {cancelText}
          </Button>

          <AlertDialogAction
            onClick={onConfirm}
            className="border border-gray-500 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
