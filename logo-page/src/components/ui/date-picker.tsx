"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import DatePickerLib from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  mode?: "datetime" | "date";
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày & giờ",
  mode = "datetime",
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value
            ? format(
                value,
                mode === "datetime" ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"
              )
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DatePickerLib
          selected={value}
          onChange={(date) => onChange?.(date)}
          showTimeSelect={mode === "datetime"}
          timeFormat="HH:mm"
          timeIntervals={1}
          dateFormat={mode === "datetime" ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
          inline
        />
      </PopoverContent>
    </Popover>
  );
}
