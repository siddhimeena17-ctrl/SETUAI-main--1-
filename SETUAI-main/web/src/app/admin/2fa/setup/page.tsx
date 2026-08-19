import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { AdminTotpForm } from "@/components/admin-auth-forms";
import { createOtpAuthUri, formatTotpSecret } from "@/lib/totp";
import { getPendingTotpSetup } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Set Up Admin 2FA",
  description: "Enroll an authenticator app for SetuAI admin access.",
  path: "/admin/2fa/setup",
});

export default async function AdminTwoFactorSetupPage() {
  const pending = await getPendingTotpSetup();
  if (!pending) redirect("/admin/login");

  const otpUri = createOtpAuthUri({
    issuer: "SetuAI.org",
    account: pending.user.email,
    secret: pending.user.totpSecret,
  });
  const qrSvg = await QRCode.toString(otpUri, {
    type: "svg",
    margin: 1,
    width: 220,
    color: {
      dark: "#2a1b22",
      light: "#ffffff",
    },
  });

  return (
    <section className="min-h-screen bg-[#fbf8f6] px-5 py-12 text-[#2a1b22]">
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#9f0038]">Authenticator setup</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Connect an authenticator app before entering admin.</h1>
          <p className="mt-3 text-sm leading-6 text-[#7b6a70]">
            Scan the QR code with Google Authenticator, Microsoft Authenticator, Authy, 1Password, or another TOTP app. Then enter the current 6-digit code.
          </p>
          <div className="mt-6 rounded-md border border-[#e4d9dc] bg-white p-5">
            <h2 className="text-base font-black">Manual setup key</h2>
            <p className="mt-2 break-words font-mono text-sm font-bold tracking-[0.14em] text-[#4a0018]">
              {formatTotpSecret(pending.user.totpSecret)}
            </p>
          </div>
        </div>
        <div className="grid gap-5">
          <div className="grid place-items-center rounded-md border border-[#e4d9dc] bg-white p-6 shadow-xl shadow-[#2a1b22]/5">
            <div
              className="overflow-hidden rounded-md border border-[#e4d9dc] bg-white p-3"
              aria-label="Authenticator app QR code"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
          <AdminTotpForm mode="setup" />
        </div>
      </div>
    </section>
  );
}
