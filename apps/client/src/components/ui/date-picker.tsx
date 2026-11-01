import type { Ref } from "react";
import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays } from "lucide-react";
import { Calendar } from "./calendar";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLButtonElement>;
  max?: string;
  placeholder?: string;
  "aria-label"?: string;
}

function parseDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  inputRef,
  max,
  placeholder = "Choose a date",
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const maxDate = parseDate(max);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) onBlur?.();
      }}
    >
      <Popover.Trigger
        ref={inputRef}
        aria-label={ariaLabel}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-app-border bg-app-bg px-3.5 text-left text-sm text-app-text transition hover:border-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
      >
        <span className={value ? "" : "text-app-muted"}>
          {value || placeholder}
        </span>
        <CalendarDays className="size-4 text-app-muted" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} className="z-50 outline-none">
          <Popover.Popup className="rounded-xl border border-app-border bg-app-card shadow-app outline-none">
            <Calendar
              selected={selected}
              disabledAfter={maxDate}
              onSelect={(date) => {
                if (!date) return;
                onChange(formatDate(date));
                setOpen(false);
              }}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
