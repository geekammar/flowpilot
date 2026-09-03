import { ActivationForm } from "@/features/invitations/components/activation-form";
import { ActivationNotice } from "@/features/invitations/components/activation-notice";
import { getInvitationByToken } from "@/features/invitations/server/invitation-service";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تفعيل الحساب",
  // Invitation URLs carry the credential in the path — never indexable.
  robots: { index: false, follow: false },
};

/**
 * Public ADMIN activation route (PROMPT-06). The invitee is not
 * authenticated — the invitation token in the path IS the credential.
 * The page performs a READ-ONLY invitation lookup (no mutation on
 * GET): acceptance + activation run atomically at submit time through
 * the server action, composing the existing invitation services.
 */
export default async function InviteActivationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getInvitationByToken({ token });

  if (!result.success) {
    // A read failure is either transient (show an honest retry state)
    // or an unknown/malformed token (one generic panel — the message
    // never helps differentiate token states).
    const transient = result.error.code === "PERSISTENCE_FAILED";
    return (
      <ActivationShell>
        <ActivationNotice
          state={transient ? "FAILED" : "INVALID_TOKEN"}
          message={transient ? result.error.message : undefined}
        />
      </ActivationShell>
    );
  }

  const { invitation, status, businessName } = result.data;

  let content: React.ReactNode;
  if (invitation.role !== "ADMIN") {
    // STAFF invitations are not activatable here — the staff
    // activation workflow is a later, separate prompt.
    content = <ActivationNotice state="ROLE_NOT_ALLOWED" />;
  } else {
    switch (status) {
      case "REVOKED":
        content = <ActivationNotice state="REVOKED" />;
        break;
      case "EXPIRED":
        content = <ActivationNotice state="EXPIRED" />;
        break;
      case "ACTIVATED":
        content = <ActivationNotice state="ALREADY_ACTIVATED" />;
        break;
      default:
        // PENDING or ACCEPTED (not yet activated): show the form.
        // Acceptance happens at submit time; ACCEPTED is the resume
        // path of an interrupted activation.
        content = (
          <ActivationForm
            token={token}
            email={invitation.email}
            businessName={businessName}
          />
        );
    }
  }

  return <ActivationShell showSubtitle>{content}</ActivationShell>;
}

function ActivationShell({
  children,
  showSubtitle = false,
}: {
  children: React.ReactNode;
  showSubtitle?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">تفعيل الحساب</h1>
        {showSubtitle ? (
          <p className="text-muted-foreground text-sm">
            أنشئ كلمة المرور الخاصة بك لتفعيل حسابك وبدء إعداد منشأتك.
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
