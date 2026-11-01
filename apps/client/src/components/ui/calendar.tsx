import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabledAfter?: Date;
}

export function Calendar({
  selected,
  onSelect,
  disabledAfter,
}: CalendarProps) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={disabledAfter ? { after: disabledAfter } : undefined}
      className="w-fit p-3"
      classNames={{
        months: "relative",
        month: "space-y-4",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium text-app-text",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "grid size-8 place-items-center rounded-md text-app-muted transition hover:bg-app-bg hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        button_next:
          "grid size-8 place-items-center rounded-md text-app-muted transition hover:bg-app-bg hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-center text-[0.8rem] font-normal text-app-muted",
        week: "mt-2 flex w-full",
        day: "relative p-0 text-center text-sm",
        day_button:
          "grid size-9 place-items-center rounded-md font-normal text-app-text transition hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        selected: "[&>button]:bg-emerald-600 [&>button]:text-white [&>button]:hover:bg-emerald-700",
        today: "[&>button]:font-semibold [&>button]:text-emerald-700 dark:[&>button]:text-emerald-300",
        outside: "text-app-muted/50",
        disabled: "text-app-muted/40 opacity-50",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation, className }) =>
          orientation === "left" ? (
            <ChevronLeft className={className} />
          ) : (
            <ChevronRight className={className} />
          ),
      }}
    />
  );
}
