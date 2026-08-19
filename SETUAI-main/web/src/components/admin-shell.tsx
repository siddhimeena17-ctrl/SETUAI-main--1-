import Link from "next/link";
import {
  BookOpen,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  PenLine,
  School,
  SlidersHorizontal,
} from "lucide-react";
import { logoutAdminAction } from "@/app/admin/auth-actions";
import { siteConfig } from "@/content/site";

type AdminShellProps = {
  active: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const navItems = [
  { label: "Overview", href: "/admin", key: "overview", icon: LayoutDashboard },
  { label: "Site Content", href: "/admin/site-content", key: "site-content", icon: SlidersHorizontal },
  { label: "Updates", href: "/admin/posts", key: "posts", icon: FileText },
  { label: "Pages", href: "/admin/pages", key: "pages", icon: BookOpen },
  { label: "Learning Pathways", href: "/admin/programs", key: "programs", icon: School },
  { label: "Gallery", href: "/admin/gallery", key: "gallery", icon: ImageIcon },
  { label: "Submissions", href: "/admin/submissions", key: "submissions", icon: Inbox },
  { label: "Security", href: "/admin/security", key: "security", icon: LockKeyhole },
];

export function AdminShell({ active, title, description, actions, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#fbf8f6] text-[#2a1b22]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#102c34] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-5 py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center border border-white/30 text-xl font-medium text-[#f6cf63]">S</span>
            <span>
              <span className="block text-base font-black leading-tight">{siteConfig.shortName}</span>
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Admin
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.key}
              className={`mb-1 flex min-h-11 items-center gap-3 rounded-md px-4 text-sm font-bold transition ${
                active === item.key
                  ? "bg-white/16 text-white ring-2 ring-[#ec604b]"
                  : "text-white/72 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon aria-hidden="true" size={17} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-md px-4 text-sm font-bold text-white/72 hover:bg-white/10 hover:text-white"
          >
            <PenLine aria-hidden="true" size={17} />
            View live site
          </Link>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-md px-4 text-sm font-bold text-white/72 hover:bg-white/10 hover:text-white"
            >
              <LogOut aria-hidden="true" size={17} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#e4d9dc] bg-[#fbf8f6]/94 backdrop-blur-xl">
          <div className="flex min-h-24 items-center justify-between gap-4 px-5 sm:px-8">
            <div>
              <h1 className="text-3xl font-black leading-tight text-[#2a1b22]">{title}</h1>
              <p className="mt-1 text-sm font-medium text-[#7b6a70]">{description}</p>
            </div>
            <div className="flex items-center gap-3">{actions}</div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-5 pb-4 lg:hidden" aria-label="Mobile admin navigation">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.key}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-bold ${
                  active === item.key
                    ? "bg-[#102c34] text-white"
                    : "border border-[#e4d9dc] bg-white text-[#102c34]"
                }`}
              >
                <item.icon aria-hidden="true" size={16} />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
