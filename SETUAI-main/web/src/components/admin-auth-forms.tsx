"use client";

import { useActionState } from "react";
import { KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  bootstrapAdminAction,
  loginAdminAction,
  verifyLoginTotpAction,
  verifySetupTotpAction,
} from "@/app/admin/auth-actions";
import type { AdminAuthFormState } from "@/lib/admin-auth";

const initialState: AdminAuthFormState = {};

function fieldClass() {
  return "min-h-12 rounded-md border border-[#d9ccd0] bg-white px-3 text-base font-medium text-[#2a1b22] outline-none focus:border-[#9f0038] focus:ring-2 focus:ring-[#9f0038]/15";
}

function labelClass() {
  return "grid gap-2 text-sm font-black text-[#2a1b22]";
}

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p role="alert" className="rounded-md border border-[#f1c3cd] bg-[#fff4f6] px-4 py-3 text-sm font-bold text-[#9f1239]">
      {error}
    </p>
  );
}

function SubmitButton({
  pending,
  label,
  icon,
}: {
  pending: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#9f0038] px-5 text-sm font-black text-white transition hover:bg-[#7e002c] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 aria-hidden="true" className="animate-spin" size={17} /> : icon}
      {pending ? "Checking..." : label}
    </button>
  );
}

export function AdminSetupForm() {
  const [state, action, pending] = useActionState(bootstrapAdminAction, initialState);

  return (
    <form action={action} className="grid gap-5 rounded-md border border-[#e4d9dc] bg-white p-6 shadow-xl shadow-[#2a1b22]/5">
      <ErrorMessage error={state.error} />
      <label className={labelClass()}>
        Setup token
        <input
          name="bootstrapToken"
          type="password"
          autoComplete="one-time-code"
          required
          className={fieldClass()}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass()}>
          Admin name
          <input name="name" autoComplete="name" required className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Admin email
          <input name="email" type="email" autoComplete="email" required className={fieldClass()} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass()}>
          Password
          <input name="password" type="password" autoComplete="new-password" required className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Confirm password
          <input name="confirmPassword" type="password" autoComplete="new-password" required className={fieldClass()} />
        </label>
      </div>
      <p className="text-xs font-semibold leading-5 text-[#7b6a70]">
        Passwords must be at least 14 characters and include uppercase, lowercase, number, and symbol characters.
      </p>
      <SubmitButton pending={pending} label="Create admin and set up 2FA" icon={<ShieldCheck aria-hidden="true" size={17} />} />
    </form>
  );
}

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(loginAdminAction, initialState);

  return (
    <form action={action} className="grid gap-5 rounded-md border border-[#e4d9dc] bg-white p-6 shadow-xl shadow-[#2a1b22]/5">
      <input type="hidden" name="next" value={nextPath} />
      <ErrorMessage error={state.error} />
      <label className={labelClass()}>
        Admin email
        <input name="email" type="email" autoComplete="email" required className={fieldClass()} />
      </label>
      <label className={labelClass()}>
        Password
        <input name="password" type="password" autoComplete="current-password" required className={fieldClass()} />
      </label>
      <SubmitButton pending={pending} label="Continue to 2FA" icon={<LockKeyhole aria-hidden="true" size={17} />} />
    </form>
  );
}

export function AdminTotpForm({ mode }: { mode: "login" | "setup" }) {
  const actionFn = mode === "setup" ? verifySetupTotpAction : verifyLoginTotpAction;
  const [state, action, pending] = useActionState(actionFn, initialState);

  return (
    <form action={action} className="grid gap-5 rounded-md border border-[#e4d9dc] bg-white p-6 shadow-xl shadow-[#2a1b22]/5">
      <ErrorMessage error={state.error} />
      <label className={labelClass()}>
        6-digit authenticator code
        <input
          name="code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          autoComplete="one-time-code"
          required
          className={`${fieldClass()} text-center text-2xl font-black tracking-[0.25em]`}
        />
      </label>
      <SubmitButton
        pending={pending}
        label={mode === "setup" ? "Verify and enter admin" : "Verify code"}
        icon={<KeyRound aria-hidden="true" size={17} />}
      />
    </form>
  );
}
