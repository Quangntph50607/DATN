"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import React, { useState } from "react";

type ComboboxItem = {
  id: number;
  label: string;
};

interface ReusableComboboxProps {
  items: ComboboxItem[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  placeholder?: string;
  className?: string;
  showAllOption?: boolean;
  allLabel?: string;
}

export default function ReusableCombobox({
  items,
  selectedId,
  onSelect,
  placeholder = "Chọn mục",
  className,
  showAllOption = true,
  allLabel = "Tất cả",
}: ReusableComboboxProps) {
  const [open, setOpen] = useState(false);

  // Xác định phiếu chọn
  const selectedItem = selectedId
    ? items.find((item) => item.id === selectedId)
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[250px] justify-between truncate ", className)}
        >
          {selectedItem?.label ||
            (selectedId === null ? allLabel : placeholder)}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px]  p-0">
        <Command className="bg-gray-500 ">
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>Không tìm thấy</CommandEmpty>
            <CommandGroup className="">
              {showAllOption && (
                <CommandItem
                  onSelect={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 ",
                      selectedId === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {allLabel}
                </CommandItem>
              )}

              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
