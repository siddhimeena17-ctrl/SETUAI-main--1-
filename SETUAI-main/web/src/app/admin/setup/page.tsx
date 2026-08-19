import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSetupForm } from "@/components/admin-auth-forms";
import { getAdminSetupState, rejectIfAuthenticated } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Setup",
  description: "Secure first-admin setup for SetuAI.",
  path: "/admin/setup",
});

export default async function AdminSetupPage() {
  await rejectIfAuthenticated();
  const setup = await getAdminSetupState();
  if (setup.hasAdmin) redirect("/admin/login");

  return (
    <section className="min-h-screen bg-[#fbf8f6] px-5 py-12 text-[#2a1b22]">
      <div className="mx-auto grid max-w-2xl gap-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#9f0038]">First admin setup</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Create the locked-down admin account.</h1>
          <p className="mt-3 text-sm leading-6 text-[#7b6a70]">
            Setup requires the private bootstrap token from the server environment. After this step, the account must enroll an authenticator app before entering the dashboard.
          </p>
        </div>
        {!setup.status.redisConfigured || !setup.status.sessionSecretStrong || !setup.status.bootstrapTokenConfigured ? (
          <div className="rounded-md border border-[#f1c3cd] bg-white p-6">
            <h2 className="text-xl font-black text-[#9f1239]">Security configuration needed</h2>
            <p className="mt-3 text-sm leading-6 text-[#7b6a70]">
              Add Upstash Redis, a strong ADMIN_SESSION_SECRET, and ADMIN_BOOTSTRAP_TOKEN to the environment before creating the first admin.
            </p>
          </div>
        ) : (
          <AdminSetupForm />
        )}
        <Link href="/" className="text-sm font-black text-[#4a0018] hover:underline">
          Return to public site
        </Link>
      </div>
    </section>
  );
}
