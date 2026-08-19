import { redirect } from "next/navigation";
import { AdminTotpForm } from "@/components/admin-auth-forms";
import { getPendingTotpLogin } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Two-Factor Verification",
  description: "Verify SetuAI admin access with an authenticator app.",
  path: "/admin/2fa",
});

export default async function AdminTwoFactorPage() {
  const pending = await getPendingTotpLogin();
  if (!pending) redirect("/admin/login");

  return (
    <section className="min-h-screen bg-[#fbf8f6] px-5 py-12 text-[#2a1b22]">
      <div className="mx-auto grid max-w-xl gap-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#9f0038]">Two-factor verification</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Enter your authenticator code.</h1>
          <p className="mt-3 text-sm leading-6 text-[#7b6a70]">
            Open the authenticator app connected to {pending.user.email} and enter the current 6-digit code.
          </p>
        </div>
        <AdminTotpForm mode="login" />
      </div>
    </section>
  );
}
