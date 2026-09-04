"use client";

import { setTeamMemberActiveAction } from "@/features/staff/actions/team-actions";
import type {
  StaffInviteDialogComponent,
  TeamInvitationItem,
  TeamMemberItem,
} from "@/features/staff/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MEMBER_NOUNS, arabicCount } from "@/lib/arabic";

import {
  MailIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  UserRoundPlusIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useState } from "react";

const ROLE_LABELS: Record<TeamMemberItem["role"], string> = {
  ADMIN: "مدير",
  STAFF: "موظف",
};

function initials(name: string) {
  return name.trim().slice(0, 2);
}

function formatInvitationDate(iso: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

/**
 * Team directory (PROMPT-16): who operates the business — members with
 * their role and active state, plus open invitations on their way in.
 * One primary action (دعوة موظف — the route-composed invitations
 * feature dialog), a small explicit deactivate/reactivate action for
 * STAFF members only, and honest empty/error states. Not an HR system.
 */
export function TeamScreen({
  members: initialMembers,
  invitations: initialInvitations,
  currentUserId,
  InviteDialog,
}: {
  members: TeamMemberItem[];
  /** Open invitations (PENDING/ACCEPTED) preloaded by the page. */
  invitations: TeamInvitationItem[];
  /** The viewing ADMIN's user id — marks their own row. */
  currentUserId: string;
  /**
   * The invite-staff dialog (composed at the route layer from the
   * invitations feature — feature isolation is preserved).
   */
  InviteDialog: StaffInviteDialogComponent;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [dialogSession, setDialogSession] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  function openInvite() {
    setError(null);
    setDialogSession((count) => count + 1);
    setInviteOpen(true);
  }

  /** A server-confirmed invitation joins the pending list. */
  function handleInvitationCreated(invitation: TeamInvitationItem) {
    setInvitations((current) => [invitation, ...current]);
  }

  function toggleActive(member: TeamMemberItem) {
    const nextActive = !member.isActive;
    setError(null);
    setPendingToggleId(member.id);
    // Optimistic transition — rolled back if the server rejects it.
    setMembers((current) =>
      current.map((item) =>
        item.id === member.id ? { ...item, isActive: nextActive } : item,
      ),
    );
    void setTeamMemberActiveAction({
      memberId: member.id,
      isActive: nextActive,
    }).then((result) => {
      setPendingToggleId(null);
      if (!result.success) {
        setMembers((current) =>
          current.map((item) =>
            item.id === member.id
              ? { ...item, isActive: member.isActive }
              : item,
          ),
        );
        setError(result.message);
      }
    });
  }

  const hasStaff = members.some((member) => member.role === "STAFF");
  const showEmptyState = !hasStaff && invitations.length === 0;

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="الفريق"
        description="من ضمن فريق منشأتك — الأدوار وحالة كل عضو والدعوات المعلقة."
        actions={
          <Button onClick={openInvite}>
            <UserRoundPlusIcon />
            دعوة موظف
          </Button>
        }
      />

      {showEmptyState ? (
        <EmptyState
          className="bg-card min-h-56"
          icon={UsersRoundIcon}
          title="لم تُضف موظفون بعد"
          description="أنت مدير المنشأة. أدعُ موظفيك عبر بريدهم لينضموا إلى الفريق ويشاركوك المحادثات والمواعيد."
          action={
            <Button size="sm" onClick={openInvite}>
              <UserRoundPlusIcon aria-hidden className="size-4" />
              دعوة موظف
            </Button>
          }
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">أعضاء الفريق</h2>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {arabicCount(members.length, MEMBER_NOUNS)}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.id}>
              <article className="rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarFallback className="text-sm font-semibold">
                        {initials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold">
                          {member.name}
                        </h3>
                        {member.id === currentUserId ? (
                          <Badge variant="outline">أنت</Badge>
                        ) : null}
                      </div>
                      <p
                        dir="ltr"
                        className="truncate text-start text-sm text-muted-foreground"
                      >
                        {member.email}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <Badge
                          variant={
                            member.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {ROLE_LABELS[member.role]}
                        </Badge>
                        <StatusBadge
                          status={
                            member.isActive
                              ? "member-active"
                              : "member-inactive"
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {member.role === "STAFF" ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(member)}
                        disabled={pendingToggleId === member.id}
                      >
                        {member.isActive ? (
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
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {invitations.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">دعوات معلقة</h2>
          <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                  <MailIcon aria-hidden className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    dir="ltr"
                    className="truncate text-start text-sm font-medium"
                  >
                    {invitation.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {invitation.status === "PENDING"
                      ? "لم يقبل الموظف الدعوة بعد"
                      : "قبِل الموظف الدعوة ولم يُكمل التفعيل بعد"}
                    {" · "}
                    أُرسلت في {formatInvitationDate(invitation.createdAt)}
                  </p>
                </div>
                <StatusBadge
                  status={
                    invitation.status === "PENDING" ? "pending" : "incomplete"
                  }
                />
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            تنتهي صلاحية الدعوات غير المقبولة تلقائياً بعد 7 أيام من إنشائها،
            ويمكن حينها إنشاء دعوة جديدة لنفس البريد.
          </p>
        </section>
      ) : null}

      {/* key → the dialog remounts on every open, so it always starts
          blank (same pattern as the services/customers form dialogs). */}
      <InviteDialog
        key={dialogSession}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onCreated={handleInvitationCreated}
      />
    </div>
  );
}
