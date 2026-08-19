"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeOff, Loader2, Mail, Trash2 } from "lucide-react";

type AdminMutationButtonProps = {
  label: string;
  endpoint: string;
  method?: "PATCH" | "POST" | "DELETE";
  body?: Record<string, unknown>;
  destructive?: boolean;
};

export function AdminMutationButton({
  label,
  endpoint,
  method = "PATCH",
  body = {},
  destructive = false,
}: AdminMutationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function mutate() {
    setLoading(true);
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "DELETE" ? undefined : JSON.stringify(body),
    });

    setLoading(false);
    if (response.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={mutate}
      disabled={loading}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
        destructive
          ? "border-[#f0c8c8] bg-white text-[#9f1239] hover:bg-[#fff2f2]"
          : "border-[#e4d9dc] bg-white text-[#2a1b22] hover:bg-[#f7eef1]"
      }`}
    >
      {loading ? <Loader2 aria-hidden="true" className="animate-spin" size={15} /> : destructive ? <Trash2 aria-hidden="true" size={15} /> : method === "POST" ? <Mail aria-hidden="true" size={15} /> : <EyeOff aria-hidden="true" size={15} />}
      {label}
    </button>
  );
}
