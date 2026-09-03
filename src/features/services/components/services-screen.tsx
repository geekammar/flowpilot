"use client";

import { setServiceActiveAction } from "@/features/services/actions/service-actions";
import { ServiceFormDialog } from "@/features/services/components/service-form-dialog";
import type { ServiceListItem } from "@/features/services/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { SERVICE_NOUNS, arabicCount } from "@/lib/arabic";

import {
  Clock3Icon,
  LayersIcon,
  PauseCircleIcon,
  PencilIcon,
  PlayCircleIcon,
  PlusIcon,
} from "lucide-react";
import { useState } from "react";

/**
 * Services management screen: what the business offers, how long each
 * service takes, and its active state. One primary action (إضافة
 * خدمة), one small create/edit dialog, and a simple explicit
 * activate/deactivate action per service.
 */
export function ServicesScreen({
  initialServices,
}: {
  initialServices: ServiceListItem[];
}) {
  const [services, setServices] = useState(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceListItem | null>(null);
  const [dialogSession, setDialogSession] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setError(null);
    setDialogSession((count) => count + 1);
    setDialogOpen(true);
  }

  function openEdit(service: ServiceListItem) {
    setEditing(service);
    setError(null);
    setDialogSession((count) => count + 1);
    setDialogOpen(true);
  }

  function handleSaved(service: ServiceListItem) {
    setServices((current) => {
      const exists = current.some((item) => item.id === service.id);
      const next = exists
        ? current.map((item) => (item.id === service.id ? service : item))
        : [...current, service];
      return next.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    });
  }

  function toggleActive(service: ServiceListItem) {
    const nextActive = !service.isActive;
    setError(null);
    // Optimistic transition — rolled back if the server rejects it.
    setServices((current) =>
      current.map((item) =>
        item.id === service.id ? { ...item, isActive: nextActive } : item,
      ),
    );
    void setServiceActiveAction({ id: service.id, isActive: nextActive }).then(
      (result) => {
        if (!result.success) {
          setServices((current) =>
            current.map((item) =>
              item.id === service.id
                ? { ...item, isActive: service.isActive }
                : item,
            ),
          );
          setError(result.message);
        }
      },
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="الخدمات"
        description="قائمة خدمات منشأتك ومدة كل خدمة — تُعرض للعملاء عند الحجز."
        actions={
          <Button onClick={openCreate}>
            <PlusIcon />
            إضافة خدمة
          </Button>
        }
      />

      {services.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {arabicCount(services.length, SERVICE_NOUNS)}
          </p>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <ul className="space-y-3">
            {services.map((service) => (
              <li key={service.id}>
                <article className="rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-semibold">
                          {service.name}
                        </h2>
                        <StatusBadge
                          status={service.isActive ? "active" : "inactive"}
                        />
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock3Icon aria-hidden className="size-3.5" />
                        <span className="tabular-nums">
                          {service.durationMinutes}
                        </span>{" "}
                        دقيقة
                      </p>
                      {service.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(service)}
                      >
                        <PencilIcon />
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(service)}
                      >
                        {service.isActive ? (
                          <>
                            <PauseCircleIcon />
                            إيقاف
                          </>
                        ) : (
                          <>
                            <PlayCircleIcon />
                            تنشيط
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          className="bg-card min-h-72"
          icon={LayersIcon}
          title="لم تُضف أي خدمات بعد"
          description="الخدمات هي ما يحجزه عملاؤك — أضف أول خدمة باسمها ومدتها لتظهر في خيارات الحجز."
          action={
            <Button size="sm" onClick={openCreate}>
              <PlusIcon aria-hidden className="size-4" />
              إضافة خدمة
            </Button>
          }
        />
      )}

      {/* key → the dialog remounts on every open, so create starts
          blank and edit prefills the selected service. */}
      <ServiceFormDialog
        key={dialogSession}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editing ?? undefined}
        onSaved={handleSaved}
      />
    </div>
  );
}
