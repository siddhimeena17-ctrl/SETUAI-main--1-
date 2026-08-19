"use client";

import { usePathname } from "next/navigation";
import { Chatbot } from "@/components/chatbot";
import { LanguageProvider } from "@/components/language-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteMotion } from "@/components/site-motion";
import type { EditableSiteContent } from "@/content/editable-site";

export function SiteChrome({ children, content }: { children: React.ReactNode; content: EditableSiteContent }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main id="main">{children}</main>;
  }

  return (
    <LanguageProvider>
      <div className="relative flex min-h-screen flex-col">
        <SiteMotion />
        <SiteHeader content={content} />
        <main id="main" className="relative z-10 flex-1">
          {children}
        </main>
        <div className="relative z-10">
          <SiteFooter content={content} />
        </div>
        <Chatbot />
      </div>
    </LanguageProvider>
  );
}
