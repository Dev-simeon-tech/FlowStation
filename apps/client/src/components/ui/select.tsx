import type { Ref } from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  name?: string;
  value?: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const EMPTY_VALUE = "__flowstation_empty_select_value__";

export function Select({
  name,
  value,
  onValueChange,
  onBlur,
  inputRef,
  options,
  placeholder = "Select an option...",
  disabled = false,
  "aria-label": ariaLabel,
}: SelectProps) {
  const items = options.map((option) => ({
    value: option.value || EMPTY_VALUE,
    label: option.label,
  }));
  if (!options.some((option) => option.value === "")) {
    items.unshift({ value: EMPTY_VALUE, label: placeholder });
  }
  const selectedValue = value ? value : EMPTY_VALUE;

  return (
    <SelectPrimitive.Root
      name={name}
      inputRef={inputRef}
      value={selectedValue}
      onValueChange={(nextValue) => {
        onValueChange(nextValue === EMPTY_VALUE ? "" : (nextValue ?? ""));
      }}
      onOpenChange={(open) => {
        if (!open) onBlur?.();
      }}
      items={items}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-app-border bg-app-bg px-3.5 text-left text-sm text-app-text transition hover:border-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="text-app-muted">
          <ChevronDown className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner sideOffset={4} className="z-50 outline-none">
          <SelectPrimitive.Popup className="max-h-64 min-w-[var(--anchor-width)] overflow-hidden rounded-lg border border-app-border bg-app-card p-1 text-app-text shadow-app outline-none">
            <SelectPrimitive.List className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value || EMPTY_VALUE}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-emerald-500/10 data-[highlighted]:text-app-text data-[selected]:text-emerald-700 dark:data-[selected]:text-emerald-300"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
