// components/ui/modal.tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode } from "react";

export function Modal({
  children,
  open,
  onOpenChange,
  title,
<<<<<<< HEAD
=======
  className,
>>>>>>> 959bb71c003f55a9ebd637224587965b6aa7977f
}: {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
<<<<<<< HEAD
=======
  className?: string;
>>>>>>> 959bb71c003f55a9ebd637224587965b6aa7977f
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
<<<<<<< HEAD
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl z-50">
=======
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              bg-gray-800 p-6 rounded-lg shadow-lg w-full z-50 
              max-h-[90vh] overflow-y-auto ${className ?? "max-w-4xl"}`}
        >
>>>>>>> 959bb71c003f55a9ebd637224587965b6aa7977f
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">{title}</Dialog.Title>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
