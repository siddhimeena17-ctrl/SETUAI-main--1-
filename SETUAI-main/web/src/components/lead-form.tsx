"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { fieldsFor, type FormType } from "@/content/form-fields";

export function LeadForm({
  formType,
  title = "Start the conversation",
  compact = false,
  initialInterest = "",
}: {
  formType: FormType;
  title?: string;
  compact?: boolean;
  initialInterest?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const busy = useRef(false);
  const fields = fieldsFor(formType);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setStatus("loading");
    setStatusMessage("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType,
          sourcePage: window.location.pathname,
          payload,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          result?.error || "We could not save your request. Please try again.",
        );
      form.reset();
      setStatus("success");
      setStatusMessage(
        result?.notification === "sent"
          ? "Your request was saved and the email provider accepted the notification for SetuAI. The team will follow up."
          : "Your request was saved. The team can review it in the admin workspace; its email notification is pending. Please do not submit it again.",
      );
      if (result?.subscription === "confirmation-sent")
        setStatusMessage(
          (message) =>
            `${message} Check your email to confirm the separate updates subscription.`,
        );
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      busy.current = false;
    }
  }
  const fieldClass =
    "focus-ring min-h-11 w-full min-w-0 border border-[var(--color-line)] bg-[var(--background)] px-3 py-2 text-base text-[var(--color-ink)]";
  return (
    <form
      onSubmit={onSubmit}
      className="soft-card min-w-0 p-5 sm:p-7"
      aria-busy={status === "loading"}
    >
      <h2 className="text-2xl font-normal">{title}</h2>
      <p className="pretty mb-7 mt-3 text-sm leading-6 text-[var(--color-muted)]">
        {formType === "chapter"
          ? "Tell us about your community. Submitting an application does not imply acceptance."
          : formType === "beta"
            ? "Register your interest. SetuAI will follow up with beta access details."
            : "Share the details SetuAI needs to respond. Please avoid sensitive personal information."}
      </p>
      <input
        type="text"
        name="companyWebsite"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            className={`grid min-w-0 gap-2 text-sm font-medium ${field.kind === "textarea" ? "sm:col-span-2" : ""}`}
            key={field.name}
          >
            {field.label}
            {field.required ? " *" : ""}
            {field.kind === "select" ? (
              <select
                name={field.name}
                required={field.required}
                className={fieldClass}
                defaultValue={
                  field.options?.includes(initialInterest)
                    ? initialInterest
                    : ""
                }
              >
                <option value="">Choose one</option>
                {field.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : field.kind === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                maxLength={field.max}
                rows={compact ? 3 : 4}
                className={fieldClass}
              />
            ) : (
              <input
                name={field.name}
                required={field.required}
                type={field.kind || "text"}
                min={field.kind === "number" ? 1 : undefined}
                max={field.kind === "number" ? 999999 : undefined}
                maxLength={field.max}
                autoComplete={
                  field.name === "name"
                    ? "name"
                    : field.name === "email"
                      ? "email"
                      : field.name === "organization"
                        ? "organization"
                        : undefined
                }
                className={fieldClass}
              />
            )}
          </label>
        ))}
      </div>
      <div className="mt-6 grid gap-4 border-t border-[var(--color-line)] pt-5">
        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            required
            type="checkbox"
            name="privacyAcknowledged"
            className="mt-1 h-4 w-4 shrink-0"
          />
          <span>
            I understand SetuAI will use these details to respond, as described
            in the{" "}
            <Link href="/privacy" className="subtle-link">
              privacy notice
            </Link>
            . *
          </span>
        </label>
        {!["chapter", "beta"].includes(formType) ? (
          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              name="updatesOptIn"
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>
              Also send me SetuAI progress updates. Optional; a separate email
              confirmation is required.
            </span>
          </label>
        ) : null}
      </div>
      <button
        disabled={status === "loading" || status === "success"}
        className="focus-ring mt-6 min-h-12 w-full bg-[var(--color-deep)] px-5 py-3 font-medium text-white disabled:opacity-60"
        type="submit"
      >
        {status === "loading"
          ? "Sending…"
          : status === "success"
            ? "Request received"
            : formType === "chapter"
              ? "Submit chapter application"
              : formType === "beta"
                ? "Register beta interest"
                : "Send inquiry"}
      </button>
      {statusMessage ? (
        <p
          className="mt-5 text-sm leading-7"
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
