"use client";
import { useState } from "react";
import {
  defaultInitiatives,
  newPartner,
  newRecommendation,
  type InitiativeContent,
} from "@/content/initiatives";

type Value = string | number | boolean | Value[] | { [key: string]: Value };
const labelFor = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
const fieldClass =
  "w-full min-w-0 rounded border border-[#b8afb3] bg-white px-3 py-2 text-sm text-[#2a1b22]";
function ContentField({
  value,
  name,
  onChange,
}: {
  value: Value;
  name: string;
  onChange: (value: Value) => void;
}) {
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const data = new FormData();
      data.append("image", file);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      onChange(result.src);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  if (Array.isArray(value))
    return (
      <fieldset className="grid min-w-0 gap-4 rounded border border-[#d6cdd1] p-4">
        <legend className="px-2 font-semibold">{labelFor(name)}</legend>
        {value.map((item, index) => (
          <div
            key={index}
            className="grid min-w-0 gap-2 border-b border-[#e4d9dc] pb-4"
          >
            <ContentField
              value={item}
              name={
                typeof item === "object"
                  ? `Entry ${index + 1}`
                  : name === "homeOrder"
                    ? "Section"
                    : `Item ${index + 1}`
              }
              onChange={(next) =>
                onChange(value.map((old, at) => (at === index ? next : old)))
              }
            />
            <div className="flex flex-wrap gap-4 text-sm">
              <button
                type="button"
                disabled={!index}
                onClick={() => {
                  const next = [...value];
                  [next[index - 1], next[index]] = [
                    next[index],
                    next[index - 1],
                  ];
                  onChange(next);
                }}
              >
                Move up
              </button>
              <button
                type="button"
                disabled={index === value.length - 1}
                onClick={() => {
                  const next = [...value];
                  [next[index + 1], next[index]] = [
                    next[index],
                    next[index + 1],
                  ];
                  onChange(next);
                }}
              >
                Move down
              </button>
              {name !== "homeOrder" ? (
                <button
                  type="button"
                  onClick={() =>
                    onChange(value.filter((_, at) => at !== index))
                  }
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {name !== "homeOrder" ? (
          <button
            type="button"
            className="justify-self-start rounded border border-[#b8afb3] px-4 py-2 text-sm"
            onClick={() => {
              const template =
                name === "recommendations"
                  ? { ...newRecommendation, id: crypto.randomUUID() }
                  : name === "partners"
                    ? { ...newPartner, id: crypto.randomUUID() }
                    : name === "faqs"
                      ? { question: "", answer: "" }
                      : "";
              onChange([...value, template as Value]);
            }}
          >
            Add{" "}
            {name === "recommendations"
              ? "draft recommendation"
              : name === "partners"
                ? "draft partner"
                : "item"}
          </button>
        ) : null}
      </fieldset>
    );
  if (value && typeof value === "object")
    return (
      <details
        className="min-w-0 rounded border border-[#d6cdd1] bg-white p-4"
        open={name === "impact" || name === "textbook"}
      >
        <summary className="cursor-pointer font-semibold">
          {labelFor(name)}
        </summary>
        <div className="mt-5 grid min-w-0 gap-4">
          {Object.entries(value).map(([key, entry]) => (
            <ContentField
              key={key}
              name={key}
              value={entry}
              onChange={(next) => onChange({ ...value, [key]: next })}
            />
          ))}
        </div>
      </details>
    );
  if (typeof value === "boolean")
    return (
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
        />
        {labelFor(name)}
      </label>
    );
  const options =
    name === "status" && ["published", "draft"].includes(String(value))
      ? ["draft", "published"]
      : name === "approval"
        ? ["pending", "approved"]
        : name === "category"
          ? [
              "Founding collaboration",
              "Educational partnership",
              "Technology partnership",
              "Financial sponsorship",
            ]
          : null;
  const asset = ["image", "logo", "letterUrl", "sampleUrl"].includes(name);
  return (
    <div className="grid min-w-0 gap-2">
      <label className="grid gap-2 text-sm font-medium">
        {labelFor(name)}
        {options ? (
          <select
            value={String(value)}
            onChange={(event) => onChange(event.target.value)}
            className={fieldClass}
          >
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ) : typeof value === "number" ? (
          <input
            type="number"
            className={fieldClass}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        ) : name === "date" || name === "reportingDate" ? (
          <input
            type="date"
            className={fieldClass}
            value={String(value)}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <textarea
            rows={String(value).length > 160 ? 4 : 2}
            className={fieldClass}
            value={String(value)}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </label>
      {asset ? (
        <label className="grid gap-2 text-xs">
          {uploading
            ? "Uploading…"
            : "Upload an approved public asset (up to 5 MB)"}
          <input
            type="file"
            disabled={uploading}
            accept={
              name === "letterUrl" || name === "sampleUrl"
                ? "application/pdf"
                : "image/png,image/jpeg,image/webp,image/gif"
            }
            onChange={(event) => void upload(event.target.files?.[0])}
          />
        </label>
      ) : null}
      {uploadError ? (
        <p role="alert" className="text-sm text-red-800">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}
export function InitiativeEditor({
  value,
  onChange,
}: {
  value: InitiativeContent;
  onChange: (next: InitiativeContent) => void;
}) {
  return (
    <section className="grid min-w-0 gap-5 rounded-md border border-[#e4d9dc] bg-[#f9f7f8] p-5">
      <h2 className="text-xl font-semibold">
        Textbook, recommendations, chapters, and platform
      </h2>
      <p className="text-sm leading-6">
        Only published, approved recommendations and partners appear publicly.
        New entries start as drafts. Use exact excerpts and sanitized public
        PDFs; keep private contact details and signatures out of uploads. Empty
        image, sample, and platform URLs stay hidden. Reorder homepage sections
        with Move up / Move down.
      </p>
      {Object.entries(value || defaultInitiatives).map(([name, entry]) => (
        <ContentField
          key={name}
          name={name}
          value={entry as Value}
          onChange={(next) => onChange({ ...value, [name]: next })}
        />
      ))}
    </section>
  );
}
