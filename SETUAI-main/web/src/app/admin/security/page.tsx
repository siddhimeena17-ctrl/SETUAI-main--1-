import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getAdminAuthStatus, requireAdminPage } from "@/lib/admin-auth";
import { getAdminAuditEvents, verifyAdminAuditChain } from "@/lib/admin-store";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Security",
  description: "Review SetuAI admin environment configuration status.",
  path: "/admin/security",
});

function EnvRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#efe7e9] py-4 last:border-0">
      <span className="text-sm font-black text-[#2a1b22]">{label}</span>
      <span className={`rounded-md px-3 py-1 text-xs font-black ${configured ? "bg-[#dcf7ea] text-[#17724a]" : "bg-[#f7edf1] text-[#9f0038]"}`}>
        {configured ? "Configured" : "Missing"}
      </span>
    </div>
  );
}

export default async function AdminSecurityPage() {
  const session = await requireAdminPage("/admin/security");
  const adminAuth = getAdminAuthStatus();
  const audit = verifyAdminAuditChain(await getAdminAuditEvents());

  return (
    <AdminShell active="security" title="Security" description="Check whether required backend services are configured without exposing secret values.">
      <div className="grid max-w-4xl gap-6">
        <section className="rounded-md border border-[#e4d9dc] bg-white p-6">
          <h2 className="text-2xl font-black text-[#2a1b22]">Admin Access</h2>
          <p className="mt-2 text-sm leading-6 text-[#7b6a70]">
            Signed in as {session.user.email}. Admin access requires password verification plus an authenticator-app code.
          </p>
          <div className="mt-5">
            <EnvRow label="Upstash-backed auth store" configured={adminAuth.redisConfigured} />
            <EnvRow label="Strong admin session secret" configured={adminAuth.sessionSecretStrong} />
            <EnvRow label="Bootstrap token" configured={adminAuth.bootstrapTokenConfigured} />
            <EnvRow label="Admin email allowlist" configured={adminAuth.allowedEmailLockConfigured} />
          </div>
        </section>
        <section className="rounded-md border border-[#e4d9dc] bg-white p-6">
          <h2 className="text-2xl font-black text-[#2a1b22]">Recovery Export</h2>
          <p className="mt-2 text-sm leading-6 text-[#7b6a70]">Download a protected JSON export of the current website content, submissions, subscribers, and settings. Store it in an approved private location; it may contain personal information.</p>
          <Link href="/api/admin/export" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[#2a1b22] px-4 py-3 text-sm font-black text-white hover:bg-[#4a0018]">Download protected export</Link>
        </section>
        <section className="rounded-md border border-[#e4d9dc] bg-white p-6">
          <h2 className="text-2xl font-black text-[#2a1b22]">Service Environment</h2>
          <div className="mt-5">
            <EnvRow label="Vercel AI Gateway key" configured={Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_API_KEY)} />
            <EnvRow label="Upstash Redis REST URL" configured={Boolean(process.env.UPSTASH_REDIS_REST_URL)} />
            <EnvRow label="Upstash Redis REST token" configured={Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)} />
            <EnvRow label="Resend API key" configured={Boolean(process.env.RESEND_API_KEY)} />
            <EnvRow label="Verified updates sender" configured={Boolean(process.env.UPDATES_FROM_EMAIL)} />
            <EnvRow label="Inquiry notification recipient" configured={Boolean(process.env.INQUIRY_NOTIFY_TO)} />
            <EnvRow label="Inquiry notification sender" configured={Boolean(process.env.INQUIRY_FROM_EMAIL)} />
            <EnvRow label="Update webhook secret" configured={Boolean(process.env.UPDATES_WEBHOOK_SECRET)} />
            <EnvRow label="Sanity public delivery enabled" configured={process.env.SANITY_CONTENT_ENABLED === "true"} />
          </div>
        </section>
        <section className="rounded-md border border-[#e4d9dc] bg-white p-6">
          <h2 className="text-2xl font-black text-[#2a1b22]">Audit Integrity</h2>
          <p className="mt-2 text-sm leading-6 text-[#7b6a70]">
            New admin security events are chained with SHA-256 hashes. Legacy events created before this hardening pass are counted separately.
          </p>
          <div className="mt-5">
            <EnvRow label="Hash chain verified" configured={audit.verified} />
            <EnvRow label={`${audit.checked} chained audit events`} configured={audit.checked > 0} />
            <EnvRow label={`${audit.legacy} legacy audit events`} configured={audit.legacy === 0} />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
