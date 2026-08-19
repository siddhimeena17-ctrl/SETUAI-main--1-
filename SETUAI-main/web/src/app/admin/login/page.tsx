import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-auth-forms";
import { getAdminSetupState, rejectIfAuthenticated } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata = createMetadata({
  title: "Admin Login",
  description: "Secure SetuAI admin login.",
  path: "/admin/login",
});

function sanitizeNextPath(value?: string) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  return value;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  await rejectIfAuthenticated();
  const setup = await getAdminSetupState();
  if (!setup.hasAdmin) redirect("/admin/setup");
  const { next } = await searchParams;

  return (
    <section className="min-h-screen bg-[#fbf8f6] px-5 py-12 text-[#2a1b22]">
      <div className="mx-auto grid max-w-xl gap-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#9f0038]">SetuAI Admin</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Sign in securely.</h1>
          <p className="mt-3 text-sm leading-6 text-[#7b6a70]">
            Use your admin email and password. The next screen will require your authenticator app code.
          </p>
        </div>
        <AdminLoginForm nextPath={sanitizeNextPath(next)} />
        <Link href="/" className="text-sm font-black text-[#4a0018] hover:underline">
          Return to public site
        </Link>
      </div>
    </section>
  );
}
