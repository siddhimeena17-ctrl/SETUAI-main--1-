"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { SetuAiMark } from "@/components/setuai-mark";
import { translatePhrase, type Locale } from "@/lib/i18n";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function initialAssistantMessage(locale: Locale) {
  if (locale === "hi") {
    return "नमस्ते, मैं SetuAI assistant हूं। आप पहल की स्थिति, स्कूल बातचीत, पाठ्यपुस्तक, स्वयंसेवा या भविष्य के समर्थन के बारे में पूछ सकते हैं।";
  }

  return "Hi, I am the SetuAI assistant. Ask about SetuAI's current work, school and partner conversations, the textbook initiative, volunteering, or collaboration opportunities.";
}

export function Chatbot() {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const t = (value: string) => translatePhrase(value, locale);

  const conversationMessages = useMemo<ChatMessage[]>(
    () => (messages.length ? messages : [{ role: "assistant", content: initialAssistantMessage(locale) }]),
    [locale, messages],
  );
  const visibleMessages = useMemo(() => conversationMessages.slice(-8), [conversationMessages]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...conversationMessages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-6), locale }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.reply ||
            data.error ||
            (locale === "hi"
              ? "मैं अभी इसका जवाब नहीं दे पाया। कृपया संपर्क फॉर्म इस्तेमाल करें और SetuAI टीम जवाब देगी।"
              : "I could not answer that yet. Please use the contact form and the SetuAI team can follow up."),
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            locale === "hi"
              ? "अभी कनेक्शन में समस्या है। कृपया संपर्क फॉर्म इस्तेमाल करें और SetuAI जवाब देगा।"
              : "I am having trouble connecting right now. Please use the contact form and SetuAI can follow up.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
      {open ? (
        <div className="mb-3 flex h-[min(620px,calc(100dvh-120px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--background)]">
          <div className="flex items-center justify-between bg-[var(--color-deep)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <SetuAiMark className="h-9 w-9 border border-white/15" sizes="36px" />
              <div>
                <p className="text-sm font-semibold">SetuAI Assistant</p>
                <p className="text-xs font-normal text-white/68">{t("AI literacy support")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring grid h-9 w-9 place-items-center hover:bg-white/10"
              aria-label={t("Close assistant")}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-surface)] p-4" aria-live="polite">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                className={message.role === "user" ? "flex justify-end" : "flex items-start gap-2"}
              >
                {message.role === "assistant" ? <SetuAiMark className="mt-1 h-6 w-6 border border-[var(--color-line)]" sizes="24px" /> : null}
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[84%] bg-[var(--color-coral)] px-4 py-3 text-sm leading-6 text-white"
                      : "max-w-[84%] border border-[var(--color-line)] bg-[var(--background)] px-4 py-3 text-sm leading-6 text-[var(--color-ink)]"
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                  <Loader2 aria-hidden="true" size={16} className="animate-spin" />
                  {t("Thinking…")}
                </div>
              </div>
            ) : null}
          </div>

          <form ref={formRef} onSubmit={sendMessage} className="border-t border-[var(--color-line)] bg-[var(--background)] p-3">
            <label className="sr-only" htmlFor="chat-message">
              {t("Message")}
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <textarea
                id="chat-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                name="message"
                autoComplete="off"
                spellCheck={true}
                className="focus-ring resize-none border border-[var(--color-line)] bg-[var(--background)] px-3 py-2 text-sm font-normal text-[var(--color-ink)] placeholder:text-[rgb(28_25_23/0.48)]"
                placeholder={t("Ask about SetuAI…")}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="focus-ring grid h-full min-h-11 w-11 place-items-center bg-[var(--color-coral)] text-white transition-colors duration-150 hover:bg-[var(--color-coral-deep)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={t("Send message")}
              >
                <Send aria-hidden="true" size={17} />
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring grid h-12 w-12 place-items-center bg-[var(--color-deep)] p-1 transition-colors duration-150 hover:bg-[var(--color-coral)] sm:h-14 sm:w-14"
          aria-label={t("Open SetuAI assistant")}
        >
          <SetuAiMark className="h-10 w-10 sm:h-12 sm:w-12" sizes="56px" />
        </button>
      ) : null}
    </div>
  );
}
