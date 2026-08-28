"use client";

import { loginSchema } from "@/features/auth/schemas/login-schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

function safeInternalPath(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      rememberMe: formData.get("rememberMe") === "on",
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await authClient.signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: parsed.data.rememberMe,
    });
    setSubmitting(false);

    if (signInError) {
      setError(
        signInError.status === 401
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : "تعذر تسجيل الدخول، حاول مرة أخرى",
      );
      return;
    }

    const target = safeInternalPath(searchParams.get("redirect"));
    startTransition(() => {
      router.replace(target);
      router.refresh();
    });
  }

  const busy = submitting || isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder="name@example.com"
          required
          className="text-start"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">كلمة المرور</Label>
          {/* Placeholder — password reset arrives after Spec A. */}
          <Link
            href="/forgot-password"
            tabIndex={-1}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            dir="ltr"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="text-start pe-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
            }
            className="text-muted-foreground hover:text-foreground absolute end-2 top-1/2 -translate-y-1/2 rounded-sm p-1 transition-colors"
          >
            {showPassword ? (
              <EyeOffIcon aria-hidden className="size-4" />
            ) : (
              <EyeIcon aria-hidden className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="rememberMe" name="rememberMe" defaultChecked />
        <Label htmlFor="rememberMe" className="text-sm font-normal">
          تذكرني
        </Label>
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-center text-sm">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? (
          <LoaderCircleIcon aria-hidden className="animate-spin" />
        ) : null}
        {busy ? "جارٍ الدخول…" : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
