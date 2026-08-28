"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { SearchIcon, XIcon } from "lucide-react";

export function SearchInput({
  value,
  onValueChange,
  placeholder = "بحث…",
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <SearchIcon
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        dir="auto"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="ps-9 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onValueChange("")}
          aria-label="مسح البحث"
          className="text-muted-foreground hover:text-foreground absolute end-2 top-1/2 -translate-y-1/2 rounded-sm p-1 transition-colors"
        >
          <XIcon aria-hidden className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
