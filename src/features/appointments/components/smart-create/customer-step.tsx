"use client";

import { searchBookingCustomersAction } from "@/features/appointments/actions/booking-flow-actions";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";
import type { BookingCustomerOption } from "@/features/appointments/types";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEARCH_RESULT_NOUNS, arabicCount } from "@/lib/arabic";
import { cn } from "@/lib/utils";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  MessageCircleIcon,
  UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * Step 1 — العميل. Focused customer selection: search by name or phone
 * (debounced, tenant-scoped server action), a clear empty state when
 * nothing matches, and an obvious selected-customer state that is easy
 * to change before continuing.
 */
export function CustomerStep({
  initialCustomers,
  selected,
  onSelect,
}: {
  /** Most recent customers, preloaded by the page (empty query). */
  initialCustomers: BookingCustomerOption[];
  selected: BookingCustomerOption | null;
  onSelect: (customer: BookingCustomerOption) => void;
}) {
  const [searching, setSearching] = useState(!selected);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const search = useQuery({
    queryKey: ["booking-customers", debouncedQuery],
    queryFn: () => searchBookingCustomersAction({ query: debouncedQuery }),
    enabled: searching,
    placeholderData: keepPreviousData,
    initialData:
      debouncedQuery === "" && searching
        ? { success: true, customers: initialCustomers }
        : undefined,
  });

  if (!searching && selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4">
          <CheckCircle2Icon
            aria-hidden
            className="size-5 shrink-0 text-primary"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{selected.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground" dir="ltr">
              <span className="tabular-nums">{selected.phone}</span>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSearching(true)}
          >
            تغيير العميل
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          يمكنك تغيير العميل في أي وقت قبل إنشاء الموعد.
        </p>
      </div>
    );
  }

  const results =
    search.data && search.data.success ? search.data.customers : null;
  const searchError =
    search.data && !search.data.success ? search.data.message : null;
  const error = searchError ?? (search.error ? "تعذر البحث الآن" : null);

  return (
    <div className="space-y-4">
      <SearchInput
        value={query}
        onValueChange={setQuery}
        placeholder="ابحث بالاسم أو رقم الهاتف"
        className="max-w-full"
        autoFocus
      />

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <p role="alert">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void search.refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : null}

      {search.isPending ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-3 w-24" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : results ? (
        results.length === 0 ? (
          query.trim() === "" ? (
            <EmptyState
              icon={UserRoundIcon}
              title="لا يوجد عملاء بعد"
              description="يُضاف العملاء تلقائياً من محادثات واتساب — افتح المحادثات لبدء التواصل."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href="/conversations">
                    <MessageCircleIcon aria-hidden className="size-4" />
                    فتح المحادثات
                  </Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={UserRoundIcon}
              title="لا توجد نتائج مطابقة"
              description="جرّب البحث بجزء من الاسم أو برقم الهاتف."
            />
          )
        ) : (
          <>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {arabicCount(results.length, SEARCH_RESULT_NOUNS)}
            </p>
            <ul className="space-y-2">
              {results.map((customer) => {
                const isSelected = selected?.id === customer.id;
                return (
                  <li key={customer.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(customer);
                        setSearching(false);
                      }}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border bg-card p-3.5 text-start transition-colors hover:bg-accent/60",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border",
                      )}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <UserRoundIcon
                          aria-hidden
                          className="size-4 text-muted-foreground"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {customer.name}
                        </span>
                        <span
                          className="mt-0.5 block text-xs text-muted-foreground"
                          dir="ltr"
                        >
                          <span className="tabular-nums">{customer.phone}</span>
                        </span>
                      </span>
                      {isSelected ? (
                        <CheckCircle2Icon
                          aria-hidden
                          className="size-5 shrink-0 text-primary"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )
      ) : null}
    </div>
  );
}
