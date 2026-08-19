"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { EditableCard, EditableFoundingPartner, EditableImage, EditableSiteContent } from "@/content/editable-site";
import type { Cta, LinkItem, PageSection } from "@/content/site";
import type { CmsPage, CmsPost, CmsProgram, CmsSettings, GalleryAlbum } from "@/lib/cms";

type SaveState = "idle" | "saving" | "error";
type SectionName = keyof EditableSiteContent["home"];

function fieldClass() {
  return "min-h-11 rounded-md border border-[#d9ccd0] bg-white px-3 text-base font-medium text-[#2a1b22] outline-none focus:border-[#9f0038] focus:ring-2 focus:ring-[#9f0038]/15";
}

function labelClass() {
  return "grid gap-2 text-sm font-black text-[#2a1b22]";
}

function splitLines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitParagraphs(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function newCta(): Cta {
  return { label: "Learn more", href: "/", variant: "primary" };
}

function newCard(): EditableCard {
  return { title: "New card", body: "Describe this item.", href: "/", icon: "sparkles" };
}

function newLink(): LinkItem {
  return { label: "New link", href: "/" };
}

function normalizeParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  help?: string;
}) {
  return (
    <label className={labelClass()}>
      {label}
      <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass()} />
      {help ? <span className="text-xs font-semibold leading-5 text-[#7b6a70]">{help}</span> : null}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  required,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  help?: string;
}) {
  return (
    <label className={labelClass()}>
      {label}
      <textarea required={required} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass()} py-3`} />
      {help ? <span className="text-xs font-semibold leading-5 text-[#7b6a70]">{help}</span> : null}
    </label>
  );
}

function FieldPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <details open className="rounded-md border border-[#e4d9dc] bg-white">
      <summary className="cursor-pointer list-none border-b border-[#e4d9dc] px-5 py-4 marker:hidden">
        <h2 className="text-lg font-black text-[#2a1b22]">{title}</h2>
        <p className="mt-1 text-sm font-medium leading-6 text-[#7b6a70]">{description}</p>
      </summary>
      <div className="grid gap-5 p-5">{children}</div>
    </details>
  );
}

function SmallButton({
  label,
  onClick,
  destructive,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition ${
        destructive
          ? "border-[#f2c7d1] text-[#9f0038] hover:bg-[#fff1f4]"
          : "border-[#d9ccd0] text-[#2a1b22] hover:bg-[#f7eef1]"
      }`}
    >
      {destructive ? <Trash2 aria-hidden="true" size={15} /> : <Plus aria-hidden="true" size={15} />}
      {label}
    </button>
  );
}

function CtaEditor({ cta, onChange, label }: { cta: Cta; onChange: (cta: Cta) => void; label: string }) {
  return (
    <div className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4 md:grid-cols-[1fr_1fr_0.7fr]">
      <TextField label={`${label} label`} value={cta.label || ""} onChange={(value) => onChange({ ...cta, label: value })} />
      <TextField label={`${label} link`} value={cta.href || ""} onChange={(value) => onChange({ ...cta, href: value })} />
      <label className={labelClass()}>
        Style
        <select
          value={cta.variant || "primary"}
          onChange={(event) => onChange({ ...cta, variant: event.target.value as Cta["variant"] })}
          className={fieldClass()}
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="light">Light</option>
        </select>
      </label>
    </div>
  );
}

function ImageEditor({ image, onChange, label }: { image: EditableImage; onChange: (image: EditableImage) => void; label: string }) {
  const inputId = useId();
  const [uploadState, setUploadState] = useState<SaveState>("idle");
  const [uploadError, setUploadError] = useState("");

  async function uploadImage(file: File | undefined) {
    if (!file) return;

    setUploadState("saving");
    setUploadError("");

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.src) {
      setUploadState("error");
      setUploadError(result?.error || "Upload failed.");
      return;
    }

    onChange({
      src: result.src,
      alt: image.alt || result.alt || label,
    });
    setUploadState("idle");
  }

  return (
    <div className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4">
      <div className="grid gap-4 md:grid-cols-[8rem_1fr]">
        <div className="overflow-hidden rounded-md border border-[#d9ccd0] bg-white">
          {image.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.src} alt="" className="h-32 w-full object-cover" />
          ) : (
            <div className="grid h-32 place-items-center px-3 text-center text-xs font-black text-[#7b6a70]">
              No image
            </div>
          )}
        </div>
        <div className="grid gap-3 content-start">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={inputId}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[#d9ccd0] bg-white px-3 text-sm font-black text-[#2a1b22] transition hover:bg-[#f7eef1]"
            >
              {uploadState === "saving" ? "Uploading..." : "Choose image"}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              disabled={uploadState === "saving"}
              className="sr-only"
              onChange={(event) => {
                void uploadImage(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <p className="text-xs font-semibold leading-5 text-[#7b6a70]">PNG, JPG, WebP, or GIF up to 5MB.</p>
          </div>
          {uploadState === "error" ? <p className="text-sm font-bold text-[#9f1239]">{uploadError}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label={`${label} path or URL`} value={image.src || ""} onChange={(value) => onChange({ ...image, src: value })} />
        <TextField label={`${label} alt text`} value={image.alt || ""} onChange={(value) => onChange({ ...image, alt: value })} />
      </div>
    </div>
  );
}

function LinkListEditor({ links, onChange, label }: { links: LinkItem[]; onChange: (links: LinkItem[]) => void; label: string }) {
  function updateLink(index: number, next: LinkItem) {
    onChange(links.map((link, itemIndex) => (itemIndex === index ? next : link)));
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-[#2a1b22]">{label}</h3>
        <SmallButton label="Add link" onClick={() => onChange([...links, newLink()])} />
      </div>
      {links.map((link, index) => (
        <div key={`${label}-${index}`} className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <TextField label="Label" value={link.label || ""} onChange={(value) => updateLink(index, { ...link, label: value })} />
            <TextField label="Link" value={link.href || ""} onChange={(value) => updateLink(index, { ...link, href: value })} />
            <SmallButton label="Remove" destructive onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))} />
          </div>
          <TextAreaField
            label="Dropdown description"
            value={link.description || ""}
            onChange={(value) => updateLink(index, { ...link, description: value })}
            rows={2}
            help="Used for dropdown child links. Leave blank for normal links."
          />
          <LinkListEditor
            label="Dropdown child links"
            links={link.children || []}
            onChange={(children) => updateLink(index, { ...link, children: children.length ? children : undefined })}
          />
        </div>
      ))}
    </div>
  );
}

function FoundingPartnerListEditor({
  partners,
  onChange,
}: {
  partners: EditableFoundingPartner[];
  onChange: (partners: EditableFoundingPartner[]) => void;
}) {
  function updatePartner(index: number, next: EditableFoundingPartner) {
    onChange(partners.map((partner, partnerIndex) => (partnerIndex === index ? next : partner)));
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-[#2a1b22]">Founding partners</h3>
        <SmallButton label="Add partner" onClick={() => onChange([...partners, { name: "New partner", href: "/", role: "Founding partner", body: "Describe this partner's confirmed role." }])} />
      </div>
      {partners.map((partner, index) => (
        <div key={`${partner.name}-${index}`} className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <TextField label="Partner name" value={partner.name} onChange={(name) => updatePartner(index, { ...partner, name })} />
            <TextField label="Partner link" value={partner.href} onChange={(href) => updatePartner(index, { ...partner, href })} />
            <SmallButton label="Remove" destructive onClick={() => onChange(partners.filter((_, partnerIndex) => partnerIndex !== index))} />
          </div>
          <TextField label="Confirmed role" value={partner.role} onChange={(role) => updatePartner(index, { ...partner, role })} />
          <TextAreaField label="Public description" value={partner.body} onChange={(body) => updatePartner(index, { ...partner, body })} rows={3} />
        </div>
      ))}
    </div>
  );
}

function CardListEditor({ cards, onChange, label }: { cards: EditableCard[]; onChange: (cards: EditableCard[]) => void; label: string }) {
  function updateCard(index: number, next: EditableCard) {
    onChange(cards.map((card, itemIndex) => (itemIndex === index ? next : card)));
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-[#2a1b22]">{label}</h3>
        <SmallButton label="Add card" onClick={() => onChange([...cards, newCard()])} />
      </div>
      {cards.map((card, index) => (
        <div key={`${label}-${index}`} className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <TextField label="Title" value={card.title || ""} onChange={(value) => updateCard(index, { ...card, title: value })} />
            <TextField label="Icon name" value={card.icon || ""} onChange={(value) => updateCard(index, { ...card, icon: value })} />
            <SmallButton label="Remove" destructive onClick={() => onChange(cards.filter((_, itemIndex) => itemIndex !== index))} />
          </div>
          <TextAreaField label="Body" value={card.body || ""} onChange={(value) => updateCard(index, { ...card, body: value })} rows={3} />
          <TextField label="Optional link" value={card.href || ""} onChange={(value) => updateCard(index, { ...card, href: value })} />
        </div>
      ))}
    </div>
  );
}

function StringListEditor({ items, onChange, label }: { items: string[]; onChange: (items: string[]) => void; label: string }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-[#2a1b22]">{label}</h3>
        <SmallButton label="Add item" onClick={() => onChange([...items, "New item"])} />
      </div>
      {items.map((item, index) => (
        <div key={`${label}-${index}`} className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={item}
            onChange={(event) => onChange(items.map((entry, itemIndex) => (itemIndex === index ? event.target.value : entry)))}
            className={fieldClass()}
          />
          <SmallButton label="Remove" destructive onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
    </div>
  );
}

function StatsEditor({ stats, onChange }: { stats: EditableSiteContent["home"]["stats"]; onChange: (stats: EditableSiteContent["home"]["stats"]) => void }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-[#2a1b22]">Public status signals</h3>
        <SmallButton label="Add signal" onClick={() => onChange([...stats, { value: "In development", label: "new status", detail: "State what is known and how it was verified." }])} />
      </div>
      {stats.map((stat, index) => (
        <div key={`stat-${index}`} className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4">
          <div className="grid gap-4 md:grid-cols-[0.6fr_1fr_auto] md:items-end">
          <TextField label="Status or value" value={stat.value} onChange={(value) => onChange(stats.map((item, itemIndex) => (itemIndex === index ? { ...item, value } : item)))} help="Use a number only when it is verified and dated." />
            <TextField label="Label" value={stat.label} onChange={(labelValue) => onChange(stats.map((item, itemIndex) => (itemIndex === index ? { ...item, label: labelValue } : item)))} />
            <SmallButton label="Remove" destructive onClick={() => onChange(stats.filter((_, itemIndex) => itemIndex !== index))} />
          </div>
          <TextAreaField label="Detail" value={stat.detail} onChange={(detail) => onChange(stats.map((item, itemIndex) => (itemIndex === index ? { ...item, detail } : item)))} rows={2} />
        </div>
      ))}
    </div>
  );
}

function OptionalCtaEditor({ cta, onChange, label }: { cta?: Cta; onChange: (cta?: Cta) => void; label: string }) {
  if (!cta) {
    return <SmallButton label={`Add ${label}`} onClick={() => onChange(newCta())} />;
  }

  return (
    <div className="grid gap-3">
      <CtaEditor cta={cta} onChange={onChange} label={label} />
      <div>
        <SmallButton label={`Remove ${label}`} destructive onClick={() => onChange(undefined)} />
      </div>
    </div>
  );
}

function newPageSection(type: PageSection["type"]): PageSection {
  if (type === "cards") {
    return { type, title: "New card section", body: "Explain this group.", cards: [newCard()] };
  }
  if (type === "steps") {
    return { type, title: "New process section", body: "Explain this process.", steps: [{ title: "First step", body: "Explain what happens." }] };
  }
  if (type === "image") {
    return { type, title: "New image section", body: "Explain this visual.", image: "/images/skypa-partnership-workshop.png", imageAlt: "SetuAI.org workshop" };
  }
  if (type === "faq") {
    return { type, title: "Questions", faqs: [{ question: "What should visitors know?", answer: "Add a helpful answer." }] };
  }
  if (type === "cta") {
    return { type, title: "Take the next step", body: "Invite visitors to act.", ctas: [newCta()] };
  }
  return { type: "text", title: "New text section", body: ["Add page content here."] };
}

function PageSectionsEditor({ sections, onChange }: { sections: PageSection[]; onChange: (sections: PageSection[]) => void }) {
  function updateSection(index: number, next: PageSection) {
    onChange(sections.map((section, sectionIndex) => (sectionIndex === index ? next : section)));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-black text-[#2a1b22]">Page sections</h3>
        <div className="flex flex-wrap gap-2">
          {(["text", "cards", "steps", "image", "faq", "cta"] as PageSection["type"][]).map((type) => (
            <SmallButton key={type} label={`Add ${type}`} onClick={() => onChange([...sections, newPageSection(type)])} />
          ))}
        </div>
      </div>

      {sections.map((section, index) => (
        <details key={`page-section-${index}`} open className="rounded-md border border-[#e4d9dc] bg-white">
          <summary className="cursor-pointer list-none border-b border-[#e4d9dc] px-4 py-3 marker:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-[#2a1b22]">{section.title || "Untitled section"}</p>
                <p className="mt-1 text-xs font-bold text-[#7b6a70]">Type: {section.type}</p>
              </div>
              <SmallButton label="Remove" destructive onClick={() => onChange(sections.filter((_, sectionIndex) => sectionIndex !== index))} />
            </div>
          </summary>
          <div className="grid gap-4 p-4">
            <TextField label="Small label" value={section.eyebrow || ""} onChange={(eyebrow) => updateSection(index, { ...section, eyebrow }) as void} />
            <TextField label="Section title" value={section.title || ""} onChange={(title) => updateSection(index, { ...section, title }) as void} />

            {section.type === "text" ? (
              <>
                <TextAreaField
                  label="Body paragraphs"
                  value={section.body.join("\n\n")}
                  onChange={(value) => updateSection(index, { ...section, body: normalizeParagraphs(value) })}
                  rows={7}
                />
                <OptionalCtaEditor cta={section.cta} onChange={(cta) => updateSection(index, { ...section, cta })} label="CTA" />
              </>
            ) : null}

            {section.type === "cards" ? (
              <>
                <TextAreaField label="Section body" value={section.body || ""} onChange={(body) => updateSection(index, { ...section, body })} rows={3} />
                <CardListEditor cards={section.cards} onChange={(cards) => updateSection(index, { ...section, cards })} label="Cards" />
              </>
            ) : null}

            {section.type === "steps" ? (
              <>
                <TextAreaField label="Section body" value={section.body || ""} onChange={(body) => updateSection(index, { ...section, body })} rows={3} />
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-black text-[#2a1b22]">Steps</h4>
                    <SmallButton label="Add step" onClick={() => updateSection(index, { ...section, steps: [...section.steps, { title: "New step", body: "Explain this step." }] })} />
                  </div>
                  {section.steps.map((step, stepIndex) => (
                    <div key={`step-${stepIndex}`} className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4">
                      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                        <TextField
                          label="Step title"
                          value={step.title}
                          onChange={(title) =>
                            updateSection(index, {
                              ...section,
                              steps: section.steps.map((item, itemIndex) => (itemIndex === stepIndex ? { ...item, title } : item)),
                            })
                          }
                        />
                        <SmallButton label="Remove" destructive onClick={() => updateSection(index, { ...section, steps: section.steps.filter((_, itemIndex) => itemIndex !== stepIndex) })} />
                      </div>
                      <TextAreaField
                        label="Step body"
                        value={step.body}
                        onChange={(body) =>
                          updateSection(index, {
                            ...section,
                            steps: section.steps.map((item, itemIndex) => (itemIndex === stepIndex ? { ...item, body } : item)),
                          })
                        }
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {section.type === "image" ? (
              <>
                <TextAreaField label="Body" value={section.body} onChange={(body) => updateSection(index, { ...section, body })} rows={4} />
                <ImageEditor
                  image={{ src: section.image, alt: section.imageAlt }}
                  onChange={(image) => updateSection(index, { ...section, image: image.src, imageAlt: image.alt })}
                  label="Section image"
                />
                <OptionalCtaEditor cta={section.cta} onChange={(cta) => updateSection(index, { ...section, cta })} label="CTA" />
              </>
            ) : null}

            {section.type === "faq" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-black text-[#2a1b22]">Questions</h4>
                  <SmallButton label="Add question" onClick={() => updateSection(index, { ...section, faqs: [...section.faqs, { question: "New question", answer: "Add the answer." }] })} />
                </div>
                {section.faqs.map((faq, faqIndex) => (
                  <div key={`faq-${faqIndex}`} className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4">
                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                      <TextField
                        label="Question"
                        value={faq.question}
                        onChange={(question) =>
                          updateSection(index, {
                            ...section,
                            faqs: section.faqs.map((item, itemIndex) => (itemIndex === faqIndex ? { ...item, question } : item)),
                          })
                        }
                      />
                      <SmallButton label="Remove" destructive onClick={() => updateSection(index, { ...section, faqs: section.faqs.filter((_, itemIndex) => itemIndex !== faqIndex) })} />
                    </div>
                    <TextAreaField
                      label="Answer"
                      value={faq.answer}
                      onChange={(answer) =>
                        updateSection(index, {
                          ...section,
                          faqs: section.faqs.map((item, itemIndex) => (itemIndex === faqIndex ? { ...item, answer } : item)),
                        })
                      }
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {section.type === "cta" ? (
              <>
                <TextAreaField label="Body" value={section.body} onChange={(body) => updateSection(index, { ...section, body })} rows={3} />
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-black text-[#2a1b22]">CTA buttons</h4>
                    <SmallButton label="Add button" onClick={() => updateSection(index, { ...section, ctas: [...section.ctas, newCta()] })} />
                  </div>
                  {section.ctas.map((cta, ctaIndex) => (
                    <div key={`cta-${ctaIndex}`} className="grid gap-3">
                      <CtaEditor
                        cta={cta}
                        onChange={(nextCta) =>
                          updateSection(index, {
                            ...section,
                            ctas: section.ctas.map((item, itemIndex) => (itemIndex === ctaIndex ? nextCta : item)),
                          })
                        }
                        label={`Button ${ctaIndex + 1}`}
                      />
                      <SmallButton label="Remove button" destructive onClick={() => updateSection(index, { ...section, ctas: section.ctas.filter((_, itemIndex) => itemIndex !== ctaIndex) })} />
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}

function SubmitButton({ state }: { state: SaveState }) {
  return (
    <button
      type="submit"
      disabled={state === "saving"}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#9f0038] px-5 py-3 text-sm font-black text-white transition hover:bg-[#7e002c] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save aria-hidden="true" size={16} />
      {state === "saving" ? "Saving..." : "Save changes"}
    </button>
  );
}

function imageBackground(src?: string) {
  return src ? { backgroundImage: `url("${src.replace(/"/g, "%22")}")` } : undefined;
}

function PreviewCta({ cta, light }: { cta?: Cta; light?: boolean }) {
  if (!cta?.label) return null;

  return (
    <span
      className={[
        "inline-flex min-h-8 items-center rounded-md px-3 text-xs font-black",
        light ? "bg-white text-[#11333a]" : "bg-[#9f0038] text-white",
      ].join(" ")}
    >
      {cta.label}
    </span>
  );
}

function SiteContentPreview({ content }: { content: EditableSiteContent }) {
  const home = content.home;
  const nav = content.global.navigation.slice(0, 4);
  const footerLinks = content.global.footerColumns.flatMap((column) => column.links).slice(0, 5);

  return (
    <aside className="rounded-md border border-[#e4d9dc] bg-white p-3 shadow-sm xl:sticky xl:top-24">
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <div>
          <p className="text-sm font-black text-[#2a1b22]">Working preview</p>
          <p className="mt-1 text-xs font-semibold text-[#7b6a70]">Updates as you type before you save.</p>
        </div>
        <span className="rounded-full bg-[#e8f7f5] px-3 py-1 text-xs font-black text-[#14545c]">Homepage</span>
      </div>

      <div className="max-h-[calc(100dvh-10rem)] overflow-auto rounded-md border border-[#e4d9dc] bg-[#f8fbfa]">
        <header className="flex items-center justify-between gap-3 border-b border-[#e1eceb] bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-9 w-9 shrink-0 rounded-md bg-[#eaf3f1] bg-contain bg-center bg-no-repeat"
              style={imageBackground(content.global.logo.src)}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#17343b]">{content.global.shortName || content.global.siteName}</p>
              <p className="truncate text-[0.65rem] font-black tracking-[0.14em] text-[#53727a]">INITIATIVE</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-[0.65rem] font-black text-[#52666b] sm:flex">
            {nav.map((link) => (
              <span key={`${link.label}-${link.href}`} className="max-w-20 truncate">
                {link.label}
              </span>
            ))}
          </div>
        </header>

        <section className="relative min-h-[21rem] overflow-hidden bg-[#12343c] p-5 text-white">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.55]" style={imageBackground(home.hero.image.src)} />
          <div className="absolute inset-0 bg-[#12343c]/78" />
          <div className="relative max-w-[23rem] pt-8">
            <p className="text-[0.65rem] font-black text-[#f6cf63]">{home.hero.kicker}</p>
            <h3 className="mt-3 text-3xl font-black leading-none tracking-[-0.02em]">{home.hero.title}</h3>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/82">{home.hero.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <PreviewCta cta={home.hero.primaryCta} light />
              <PreviewCta cta={home.hero.secondaryCta} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 border-b border-[#e1eceb] bg-white">
          {home.stats.slice(0, 4).map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className="border-r border-t border-[#e1eceb] p-3">
              <p className="text-2xl font-black text-[#17343b]">{stat.value}</p>
              <p className="mt-1 text-xs font-bold leading-4 text-[#66777c]">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-3 bg-[#f8fbfa] p-4">
          <p className="text-[0.65rem] font-black text-[#14737b]">{home.intro.kicker}</p>
          <h3 className="text-xl font-black leading-6 tracking-[-0.015em] text-[#17343b]">{home.intro.title}</h3>
          <p className="rounded-md border border-[#dce9e8] bg-white p-3 text-sm font-semibold leading-6 text-[#31484f]">
            {home.intro.featuredStatement}
          </p>
        </section>

        <section className="relative overflow-hidden bg-[#14333b] p-4 text-white">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.35]" style={imageBackground(home.heartbeat.image.src)} />
          <div className="absolute inset-0 bg-[#14333b]/70" />
          <div className="relative">
            <p className="text-[0.65rem] font-black text-[#f6cf63]">{home.heartbeat.kicker}</p>
            <h3 className="mt-2 text-xl font-black leading-6 tracking-[-0.015em]">{home.heartbeat.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/78">{home.heartbeat.body}</p>
            <div className="mt-4 grid gap-2">
              {home.heartbeat.pulses.slice(0, 3).map((pulse) => (
                <p key={pulse} className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-black leading-5 text-white/90">
                  {pulse}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 bg-white p-4">
          <h3 className="text-xl font-black leading-6 tracking-[-0.015em] text-[#17343b]">{home.learning.title}</h3>
          <p className="text-sm font-semibold leading-6 text-[#5e7277]">{home.learning.body}</p>
          <div className="grid gap-2">
            {home.learning.cards.slice(0, 3).map((card) => (
              <div key={card.title} className="rounded-md border border-[#e1eceb] p-3">
                <p className="text-sm font-black text-[#17343b]">{card.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#66777c]">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#e1eceb] bg-[#12343c] p-4 text-white">
          <p className="text-sm font-black">{content.global.siteName}</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-white/70">{content.global.serviceArea}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {footerLinks.map((link) => (
              <span key={`${link.label}-${link.href}`} className="rounded-full bg-white/10 px-2 py-1 text-[0.65rem] font-black text-white/80">
                {link.label}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </aside>
  );
}

type PageDraft = {
  eyebrow: string;
  title: string;
  slug: string;
  image: string;
  imageAlt: string;
  summary: string;
  description: string;
  status: CmsPage["status"];
};

function PageSectionPreview({ section }: { section: PageSection }) {
  if (section.type === "cards") {
    return (
      <div className="grid gap-2">
        <p className="text-xs font-black text-[#14737b]">{section.eyebrow}</p>
        <h4 className="text-lg font-black leading-6 text-[#17343b]">{section.title}</h4>
        <p className="text-xs font-semibold leading-5 text-[#65787d]">{section.body}</p>
        <div className="grid gap-2">
          {section.cards.slice(0, 2).map((card) => (
            <div key={card.title} className="rounded-md border border-[#e1eceb] bg-white p-3">
              <p className="text-sm font-black text-[#17343b]">{card.title}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#65787d]">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "steps") {
    return (
      <div className="grid gap-2">
        <h4 className="text-lg font-black leading-6 text-[#17343b]">{section.title}</h4>
        {section.steps.slice(0, 3).map((step, index) => (
          <p key={`${step.title}-${index}`} className="rounded-md bg-[#e8f7f5] px-3 py-2 text-xs font-black leading-5 text-[#17343b]">
            {index + 1}. {step.title}
          </p>
        ))}
      </div>
    );
  }

  if (section.type === "image") {
    return (
      <div className="grid gap-3">
        <div className="min-h-36 rounded-md bg-[#dfecea] bg-cover bg-center" style={imageBackground(section.image)} />
        <h4 className="text-lg font-black leading-6 text-[#17343b]">{section.title}</h4>
        <p className="text-xs font-semibold leading-5 text-[#65787d]">{section.body}</p>
      </div>
    );
  }

  if (section.type === "faq") {
    return (
      <div className="grid gap-2">
        <h4 className="text-lg font-black leading-6 text-[#17343b]">{section.title}</h4>
        {section.faqs.slice(0, 2).map((faq) => (
          <p key={faq.question} className="rounded-md border border-[#e1eceb] bg-white p-3 text-xs font-black leading-5 text-[#17343b]">
            {faq.question}
          </p>
        ))}
      </div>
    );
  }

  if (section.type === "cta") {
    return (
      <div className="rounded-md bg-[#9f0038] p-4 text-white">
        <h4 className="text-lg font-black leading-6">{section.title}</h4>
        <p className="mt-2 text-xs font-semibold leading-5 text-white/78">{section.body}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <p className="text-xs font-black text-[#14737b]">{section.eyebrow}</p>
      <h4 className="text-lg font-black leading-6 text-[#17343b]">{section.title}</h4>
      {section.body.slice(0, 2).map((paragraph) => (
        <p key={paragraph} className="text-xs font-semibold leading-5 text-[#65787d]">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function PageEditorPreview({
  page,
  cta,
  secondaryCta,
  sections,
}: {
  page: PageDraft;
  cta?: Cta;
  secondaryCta?: Cta;
  sections: PageSection[];
}) {
  return (
    <aside className="rounded-md border border-[#e4d9dc] bg-white p-3 shadow-sm xl:sticky xl:top-24">
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <div>
          <p className="text-sm font-black text-[#2a1b22]">Working preview</p>
          <p className="mt-1 text-xs font-semibold text-[#7b6a70]">Updates as you type before you save.</p>
        </div>
        <span className="rounded-full bg-[#fff0f4] px-3 py-1 text-xs font-black text-[#9f0038]">{page.status}</span>
      </div>

      <div className="max-h-[calc(100dvh-10rem)] overflow-auto rounded-md border border-[#e4d9dc] bg-[#f8fbfa]">
        <section className="relative min-h-[19rem] overflow-hidden bg-[#14333b] p-5 text-white">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.42]" style={imageBackground(page.image)} />
          <div className="absolute inset-0 bg-[#14333b]/78" />
          <div className="relative pt-8">
            <p className="text-[0.65rem] font-black text-[#f6cf63]">{page.eyebrow}</p>
            <h3 className="mt-3 text-3xl font-black leading-none tracking-[-0.02em]">{page.title}</h3>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/82">{page.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <PreviewCta cta={cta} light />
              <PreviewCta cta={secondaryCta} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 bg-white p-4">
          <p className="text-sm font-semibold leading-6 text-[#5e7277]">{page.description}</p>
          {sections.slice(0, 4).map((section, index) => (
            <div key={`${section.type}-${section.title}-${index}`} className="rounded-md border border-[#e1eceb] bg-[#f8fbfa] p-4">
              <PageSectionPreview section={section} />
            </div>
          ))}
        </section>
      </div>
    </aside>
  );
}

export function SiteContentForm({ content: initialContent }: { content: EditableSiteContent }) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");
  const [content, setContent] = useState<EditableSiteContent>(initialContent);

  function updateGlobal(global: Partial<EditableSiteContent["global"]>) {
    setContent((current) => ({ ...current, global: { ...current.global, ...global } }));
  }

  function updateSeo(seo: Partial<EditableSiteContent["seo"]>) {
    setContent((current) => ({ ...current, seo: { ...current.seo, ...seo } }));
  }

  function updateVisuals(visuals: Partial<EditableSiteContent["visuals"]>) {
    setContent((current) => ({ ...current, visuals: { ...current.visuals, ...visuals } }));
  }

  function updateHome<T extends SectionName>(section: T, value: EditableSiteContent["home"][T]) {
    setContent((current) => ({
      ...current,
      home: {
        ...current.home,
        [section]: value,
      },
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const response = await fetch("/api/admin/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    setState("idle");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,430px)] xl:items-start">
      <div className="grid gap-5">
      <div className="sticky top-24 z-10 flex flex-col gap-3 rounded-md border border-[#e4d9dc] bg-white/96 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-[#2a1b22]">Full-site content editor</p>
          <p className="mt-1 text-xs font-semibold text-[#7b6a70]">
            Last saved: {content.updatedAt ? new Date(content.updatedAt).toLocaleString() : "Not saved yet"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state === "error" ? <p className="text-sm font-bold text-[#9f1239]">Save failed.</p> : null}
          <SubmitButton state={state} />
        </div>
      </div>

      <FieldPanel title="Global Brand, Navigation, and Footer" description="Controls the logo, site name, main menu, footer columns, contact email, and public footer text.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Site name" value={content.global.siteName} onChange={(siteName) => updateGlobal({ siteName })} required />
          <TextField label="Short name" value={content.global.shortName} onChange={(shortName) => updateGlobal({ shortName })} required />
          <TextField label="Tagline" value={content.global.tagline} onChange={(tagline) => updateGlobal({ tagline })} required />
          <TextField label="Public email" type="email" value={content.global.email} onChange={(email) => updateGlobal({ email })} required />
        </div>
        <TextAreaField label="Organization description" value={content.global.description} onChange={(description) => updateGlobal({ description })} rows={4} required />
        <ImageEditor image={content.global.logo} onChange={(logo) => updateGlobal({ logo })} label="Logo" />
        <CtaEditor cta={content.global.navCta} onChange={(navCta) => updateGlobal({ navCta })} label="Header CTA" />
        <LinkListEditor links={content.global.navigation} onChange={(navigation) => updateGlobal({ navigation })} label="Main navigation" />
        <FoundingPartnerListEditor partners={content.global.foundingPartners} onChange={(foundingPartners) => updateGlobal({ foundingPartners })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Service area footer line" value={content.global.serviceArea} onChange={(serviceArea) => updateGlobal({ serviceArea })} />
          <TextField label="Copyright line" value={content.global.copyrightLine} onChange={(copyrightLine) => updateGlobal({ copyrightLine })} />
        </div>
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-[#2a1b22]">Footer columns</h3>
            <SmallButton
              label="Add column"
              onClick={() => updateGlobal({ footerColumns: [...content.global.footerColumns, { title: "New column", links: [newLink()] }] })}
            />
          </div>
          {content.global.footerColumns.map((column, index) => (
            <div key={`footer-column-${index}`} className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <TextField
                  label="Column title"
                  value={column.title}
                  onChange={(title) =>
                    updateGlobal({
                      footerColumns: content.global.footerColumns.map((item, itemIndex) => (itemIndex === index ? { ...item, title } : item)),
                    })
                  }
                />
                <SmallButton
                  label="Remove"
                  destructive
                  onClick={() => updateGlobal({ footerColumns: content.global.footerColumns.filter((_, itemIndex) => itemIndex !== index) })}
                />
              </div>
              <LinkListEditor
                label="Column links"
                links={column.links}
                onChange={(links) =>
                  updateGlobal({
                    footerColumns: content.global.footerColumns.map((item, itemIndex) => (itemIndex === index ? { ...item, links } : item)),
                  })
                }
              />
            </div>
          ))}
        </div>
        <LinkListEditor links={content.global.footerUtilityLinks} onChange={(footerUtilityLinks) => updateGlobal({ footerUtilityLinks })} label="Footer utility links" />
      </FieldPanel>

      <FieldPanel title="Homepage SEO" description="Controls the homepage title, description, and share image used by search engines and social previews.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="SEO title" value={content.seo.homeTitle} onChange={(homeTitle) => updateSeo({ homeTitle })} required />
          <TextField label="SEO image path" value={content.seo.homeImage} onChange={(homeImage) => updateSeo({ homeImage })} required />
        </div>
        <TextAreaField label="SEO description" value={content.seo.homeDescription} onChange={(homeDescription) => updateSeo({ homeDescription })} rows={3} required />
      </FieldPanel>

      <FieldPanel title="Homepage Hero" description="Controls the first screen: headline, intro text, hero image, primary CTA, secondary CTA, and 3D overlay settings.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Small label" value={content.home.hero.kicker} onChange={(kicker) => updateHome("hero", { ...content.home.hero, kicker })} />
          <TextField label="Headline" value={content.home.hero.title} onChange={(title) => updateHome("hero", { ...content.home.hero, title })} required />
        </div>
        <TextAreaField label="Hero body" value={content.home.hero.body} onChange={(body) => updateHome("hero", { ...content.home.hero, body })} rows={3} required />
        <ImageEditor image={content.home.hero.image} onChange={(image) => updateHome("hero", { ...content.home.hero, image })} label="Hero image" />
        <CtaEditor cta={content.home.hero.primaryCta} onChange={(primaryCta) => updateHome("hero", { ...content.home.hero, primaryCta })} label="Primary CTA" />
        <CtaEditor cta={content.home.hero.secondaryCta} onChange={(secondaryCta) => updateHome("hero", { ...content.home.hero, secondaryCta })} label="Secondary CTA" />
      </FieldPanel>

      <FieldPanel title="Homepage Intro and Impact" description="Controls the mission statement section and the four impact numbers under the hero.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Intro label" value={content.home.intro.kicker} onChange={(kicker) => updateHome("intro", { ...content.home.intro, kicker })} />
          <TextField label="Intro headline" value={content.home.intro.title} onChange={(title) => updateHome("intro", { ...content.home.intro, title })} />
        </div>
        <TextAreaField
          label="Featured statement"
          value={content.home.intro.featuredStatement}
          onChange={(featuredStatement) => updateHome("intro", { ...content.home.intro, featuredStatement })}
          rows={3}
        />
        <TextAreaField
          label="Intro paragraphs"
          value={content.home.intro.body.join("\n\n")}
          onChange={(value) => updateHome("intro", { ...content.home.intro, body: normalizeParagraphs(value) })}
          rows={6}
          help="Separate paragraphs with a blank line."
        />
        <StatsEditor stats={content.home.stats} onChange={(stats) => updateHome("stats", stats)} />
      </FieldPanel>

      <FieldPanel title="Learning Model" description="Controls the classroom learning model section and the cards inside it.">
        <TextField label="Section headline" value={content.home.learning.title} onChange={(title) => updateHome("learning", { ...content.home.learning, title })} />
        <TextAreaField label="Section body" value={content.home.learning.body} onChange={(body) => updateHome("learning", { ...content.home.learning, body })} rows={3} />
        <CardListEditor cards={content.home.learning.cards} onChange={(cards) => updateHome("learning", { ...content.home.learning, cards })} label="Learning cards" />
      </FieldPanel>

      <FieldPanel title="Mission Heartbeat" description="Controls the immersive mission section, generated visual, pulse lines, and heart animation message.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Small label" value={content.home.heartbeat.kicker} onChange={(kicker) => updateHome("heartbeat", { ...content.home.heartbeat, kicker })} />
          <TextField label="Headline" value={content.home.heartbeat.title} onChange={(title) => updateHome("heartbeat", { ...content.home.heartbeat, title })} />
        </div>
        <TextAreaField label="Body" value={content.home.heartbeat.body} onChange={(body) => updateHome("heartbeat", { ...content.home.heartbeat, body })} rows={4} />
        <ImageEditor image={content.home.heartbeat.image} onChange={(image) => updateHome("heartbeat", { ...content.home.heartbeat, image })} label="Heartbeat visual" />
        <StringListEditor items={content.home.heartbeat.pulses} onChange={(pulses) => updateHome("heartbeat", { ...content.home.heartbeat, pulses })} label="Pulse lines" />
      </FieldPanel>

      <FieldPanel title="Textbook Initiative" description="Controls the dark textbook feature section, image, callout, bullets, and buttons.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Small label" value={content.home.textbook.kicker} onChange={(kicker) => updateHome("textbook", { ...content.home.textbook, kicker })} />
          <TextField label="Headline" value={content.home.textbook.title} onChange={(title) => updateHome("textbook", { ...content.home.textbook, title })} />
        </div>
        <TextAreaField label="Body" value={content.home.textbook.body} onChange={(body) => updateHome("textbook", { ...content.home.textbook, body })} rows={4} />
        <ImageEditor image={content.home.textbook.image} onChange={(image) => updateHome("textbook", { ...content.home.textbook, image })} label="Textbook image" />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Image callout label" value={content.home.textbook.calloutLabel} onChange={(calloutLabel) => updateHome("textbook", { ...content.home.textbook, calloutLabel })} />
          <TextField label="Image callout title" value={content.home.textbook.calloutTitle} onChange={(calloutTitle) => updateHome("textbook", { ...content.home.textbook, calloutTitle })} />
        </div>
        <StringListEditor items={content.home.textbook.bullets} onChange={(bullets) => updateHome("textbook", { ...content.home.textbook, bullets })} label="Textbook bullets" />
        <CtaEditor cta={content.home.textbook.primaryCta} onChange={(primaryCta) => updateHome("textbook", { ...content.home.textbook, primaryCta })} label="Primary CTA" />
        <CtaEditor cta={content.home.textbook.secondaryCta} onChange={(secondaryCta) => updateHome("textbook", { ...content.home.textbook, secondaryCta })} label="Secondary CTA" />
      </FieldPanel>

      <FieldPanel title="Audience Paths and Partnership Process" description="Controls the partner cards and the step-by-step school partnership section.">
        <TextField label="Audience headline" value={content.home.audience.title} onChange={(title) => updateHome("audience", { ...content.home.audience, title })} />
        <TextAreaField label="Audience body" value={content.home.audience.body} onChange={(body) => updateHome("audience", { ...content.home.audience, body })} rows={3} />
        <CardListEditor cards={content.home.audience.cards} onChange={(cards) => updateHome("audience", { ...content.home.audience, cards })} label="Audience cards" />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Process label" value={content.home.process.kicker} onChange={(kicker) => updateHome("process", { ...content.home.process, kicker })} />
          <TextField label="Process headline" value={content.home.process.title} onChange={(title) => updateHome("process", { ...content.home.process, title })} />
        </div>
        <TextAreaField label="Process body" value={content.home.process.body} onChange={(body) => updateHome("process", { ...content.home.process, body })} rows={3} />
        <StringListEditor items={content.home.process.steps} onChange={(steps) => updateHome("process", { ...content.home.process, steps })} label="Process steps" />
      </FieldPanel>

      <FieldPanel title="Closing CTA and Visual Settings" description="Controls the bottom call to action and how much motion/3D appears on the public homepage.">
        <TextField label="Closing headline" value={content.home.closingCta.title} onChange={(title) => updateHome("closingCta", { ...content.home.closingCta, title })} />
        <TextAreaField label="Closing body" value={content.home.closingCta.body} onChange={(body) => updateHome("closingCta", { ...content.home.closingCta, body })} rows={3} />
        <CtaEditor cta={content.home.closingCta.primaryCta} onChange={(primaryCta) => updateHome("closingCta", { ...content.home.closingCta, primaryCta })} label="Primary CTA" />
        <CtaEditor cta={content.home.closingCta.secondaryCta} onChange={(secondaryCta) => updateHome("closingCta", { ...content.home.closingCta, secondaryCta })} label="Secondary CTA" />
        <div className="grid gap-4 rounded-md border border-[#efe5e8] bg-[#fbf8f6] p-4 md:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 text-sm font-black text-[#2a1b22]">
            <input type="checkbox" checked={content.visuals.hero3dEnabled} onChange={(event) => updateVisuals({ hero3dEnabled: event.target.checked })} />
            Show 3D hero visual
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-black text-[#2a1b22]">
            <input type="checkbox" checked={content.visuals.motionEnabled} onChange={(event) => updateVisuals({ motionEnabled: event.target.checked })} />
            Enable page motion
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-black text-[#2a1b22]">
            <input type="checkbox" checked={content.visuals.heartbeat3dEnabled} onChange={(event) => updateVisuals({ heartbeat3dEnabled: event.target.checked })} />
            Show heartbeat 3D visual
          </label>
          <TextField label="3D visual label" value={content.visuals.hero3dLabel} onChange={(hero3dLabel) => updateVisuals({ hero3dLabel })} />
          <TextField label="Heartbeat visual label" value={content.visuals.heartbeat3dLabel} onChange={(heartbeat3dLabel) => updateVisuals({ heartbeat3dLabel })} />
          <label className={labelClass()}>
            Visual density
            <select value={content.visuals.visualDensity} onChange={(event) => updateVisuals({ visualDensity: event.target.value as EditableSiteContent["visuals"]["visualDensity"] })} className={fieldClass()}>
              <option value="calm">Calm</option>
              <option value="active">Active</option>
              <option value="immersive">Immersive</option>
            </select>
          </label>
        </div>
      </FieldPanel>
      </div>
      <SiteContentPreview content={content} />
    </form>
  );
}

export function PostForm({ post }: { post?: CmsPost | null }) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");
  const [image, setImage] = useState<EditableImage>({
    src: post?.image || "/images/skypa-hero-classroom.png",
    alt: post?.imageAlt || post?.title || "SetuAI update image",
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const form = new FormData(event.currentTarget);
    const body = {
      id: post?.id,
      title: form.get("title"),
      slug: form.get("slug"),
      category: form.get("category"),
      status: form.get("status"),
      summary: form.get("summary"),
      body: splitParagraphs(form.get("body")),
      image: image.src,
      imageAlt: image.alt,
      publishedAt: form.get("publishedAt"),
    };
    const response = await fetch(post ? `/api/admin/posts/${post.id}` : "/api/admin/posts", {
      method: post ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-md border border-[#e4d9dc] bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass()}>
          Update title
          <input name="title" required defaultValue={post?.title} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          URL slug
          <input name="slug" defaultValue={post?.slug} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Category
          <select name="category" defaultValue={post?.category || "announcement"} className={fieldClass()}>
            <option value="announcement">Announcement</option>
            <option value="textbook">Textbook</option>
            <option value="program">Program</option>
            <option value="event">Event</option>
            <option value="blog">Blog</option>
          </select>
        </label>
        <label className={labelClass()}>
          Status
          <select name="status" defaultValue={post?.status || "draft"} className={fieldClass()}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className={labelClass()}>
          Publish date
          <input name="publishedAt" type="datetime-local" defaultValue={post?.publishedAt?.slice(0, 16)} className={fieldClass()} />
        </label>
      </div>
      <label className={labelClass()}>
        Summary
        <textarea name="summary" required rows={3} defaultValue={post?.summary} className={`${fieldClass()} py-3`} />
      </label>
      <label className={labelClass()}>
        Body paragraphs
        <textarea name="body" rows={10} defaultValue={post?.body?.join("\n\n")} className={`${fieldClass()} py-3`} />
      </label>
      <ImageEditor image={image} onChange={setImage} label="Update image" />
      <div className="flex items-center gap-3">
        <SubmitButton state={state} />
        {state === "error" ? <p className="text-sm font-bold text-[#9f1239]">Save failed.</p> : null}
      </div>
    </form>
  );
}

export function PageForm({ page }: { page?: CmsPage | null }) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");
  const isNew = !page;
  const initialPage: CmsPage = page || {
    id: "",
    title: "",
    slug: "",
    eyebrow: "",
    summary: "",
    description: "",
    sections: [],
    status: "draft",
    updatedAt: "",
  };
  const [draftPage, setDraftPage] = useState<PageDraft>({
    eyebrow: initialPage.eyebrow || "",
    title: initialPage.title || "",
    slug: initialPage.slug || "",
    image: initialPage.image || "",
    imageAlt: initialPage.imageAlt || "",
    summary: initialPage.summary || "",
    description: initialPage.description || "",
    status: initialPage.status,
  });
  const [sections, setSections] = useState<PageSection[]>(initialPage.sections || []);
  const [cta, setCta] = useState<Cta | undefined>(initialPage.cta);
  const [secondaryCta, setSecondaryCta] = useState<Cta | undefined>(initialPage.secondaryCta);

  function updateDraftPage<T extends keyof PageDraft>(key: T, value: PageDraft[T]) {
    setDraftPage((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const response = await fetch(isNew ? "/api/admin/pages" : `/api/admin/pages/${initialPage.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: initialPage.id || undefined,
        slug: draftPage.slug,
        eyebrow: draftPage.eyebrow,
        title: draftPage.title,
        summary: draftPage.summary,
        description: draftPage.description,
        image: draftPage.image,
        imageAlt: draftPage.imageAlt,
        cta,
        secondaryCta,
        sections,
        status: draftPage.status,
      }),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,430px)] xl:items-start">
      <div className="grid gap-5 rounded-md border border-[#e4d9dc] bg-white p-6">
      <div className="rounded-md border border-[#e4d9dc] bg-[#fbf8f6] p-4">
        <h2 className="text-lg font-black text-[#2a1b22]">Hero and SEO</h2>
        <p className="mt-1 text-sm font-medium leading-6 text-[#7b6a70]">
          These fields control the page hero, search snippet, and preview image.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass()}>
          Small label
          <input name="eyebrow" value={draftPage.eyebrow} onChange={(event) => updateDraftPage("eyebrow", event.target.value)} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Page title
          <input name="title" required value={draftPage.title} onChange={(event) => updateDraftPage("title", event.target.value)} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          URL slug
          <input name="slug" required value={draftPage.slug} onChange={(event) => updateDraftPage("slug", event.target.value)} className={fieldClass()} />
        </label>
      </div>
      <ImageEditor
        image={{ src: draftPage.image, alt: draftPage.imageAlt }}
        onChange={(image) => {
          updateDraftPage("image", image.src);
          updateDraftPage("imageAlt", image.alt);
        }}
        label="Hero image"
      />
      <label className={labelClass()}>
        Short summary
        <textarea name="summary" rows={4} required value={draftPage.summary} onChange={(event) => updateDraftPage("summary", event.target.value)} className={`${fieldClass()} py-3`} />
      </label>
      <label className={labelClass()}>
        SEO description
        <textarea name="description" rows={4} required value={draftPage.description} onChange={(event) => updateDraftPage("description", event.target.value)} className={`${fieldClass()} py-3`} />
      </label>
      <label className={labelClass()}>
        Status
        <select name="status" value={draftPage.status} onChange={(event) => updateDraftPage("status", event.target.value as PageDraft["status"])} className={fieldClass()}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </label>
      <div className="grid gap-5 rounded-md border border-[#e4d9dc] bg-[#fbf8f6] p-4">
        <h2 className="text-lg font-black text-[#2a1b22]">Hero Buttons</h2>
        <OptionalCtaEditor cta={cta} onChange={setCta} label="Primary CTA" />
        <OptionalCtaEditor cta={secondaryCta} onChange={setSecondaryCta} label="Secondary CTA" />
      </div>
      <div className="grid gap-5 rounded-md border border-[#e4d9dc] bg-[#fbf8f6] p-4">
        <PageSectionsEditor sections={sections} onChange={setSections} />
      </div>
      <SubmitButton state={state} />
      {state === "error" ? <p className="text-sm font-bold text-[#9f1239]">Save failed.</p> : null}
      </div>
      <PageEditorPreview page={draftPage} cta={cta} secondaryCta={secondaryCta} sections={sections} />
    </form>
  );
}

export function ProgramForm({ program }: { program?: CmsProgram | null }) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");
  const isNew = !program;
  const initialProgram: CmsProgram = program || {
    id: "",
    title: "",
    slug: "",
    eyebrow: "Program in development",
    summary: "",
    description: "",
    audience: "",
    length: "",
    outcomes: [],
    modules: [],
    sections: [],
    status: "draft",
    updatedAt: "",
  };
  const [image, setImage] = useState<EditableImage>({
    src: initialProgram.image || "",
    alt: initialProgram.imageAlt || initialProgram.title || "Program image",
  });
  const [sections, setSections] = useState<PageSection[]>(initialProgram.sections || []);
  const [cta, setCta] = useState<Cta | undefined>(initialProgram.cta);
  const [secondaryCta, setSecondaryCta] = useState<Cta | undefined>(initialProgram.secondaryCta);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const form = new FormData(event.currentTarget);
    const response = await fetch(isNew ? "/api/admin/programs" : `/api/admin/programs/${initialProgram.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: initialProgram.id || undefined,
        slug: form.get("slug"),
        title: form.get("title"),
        eyebrow: form.get("eyebrow"),
        summary: form.get("summary"),
        description: form.get("description"),
        image: image.src,
        imageAlt: image.alt,
        cta,
        secondaryCta,
        sections,
        audience: form.get("audience"),
        length: form.get("length"),
        outcomes: splitLines(form.get("outcomes")),
        modules: splitLines(form.get("modules")),
        status: form.get("status"),
      }),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    router.push("/admin/programs");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-md border border-[#e4d9dc] bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass()}>
          Program title
          <input name="title" required defaultValue={initialProgram.title} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          URL slug
          <input name="slug" required defaultValue={initialProgram.slug} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Small label
          <input name="eyebrow" defaultValue={initialProgram.eyebrow} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Audience
          <input name="audience" defaultValue={initialProgram.audience} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Length or format
          <input name="length" defaultValue={initialProgram.length} className={fieldClass()} />
        </label>
      </div>
      <label className={labelClass()}>
        Summary
        <textarea name="summary" rows={4} required defaultValue={initialProgram.summary} className={`${fieldClass()} py-3`} />
      </label>
      <label className={labelClass()}>
        Description
        <textarea name="description" rows={4} required defaultValue={initialProgram.description} className={`${fieldClass()} py-3`} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass()}>
          Outcomes, one per line
          <textarea name="outcomes" rows={6} defaultValue={initialProgram.outcomes.join("\n")} className={`${fieldClass()} py-3`} />
        </label>
        <label className={labelClass()}>
          Modules, one per line
          <textarea name="modules" rows={6} defaultValue={initialProgram.modules.join("\n")} className={`${fieldClass()} py-3`} />
        </label>
      </div>
      <label className={labelClass()}>
        Status
        <select name="status" defaultValue={initialProgram.status} className={fieldClass()}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </label>
      <ImageEditor image={image} onChange={setImage} label="Program image" />
      <div className="grid gap-5 rounded-md border border-[#e4d9dc] bg-[#fbf8f6] p-4">
        <h2 className="text-lg font-black text-[#2a1b22]">Program buttons</h2>
        <OptionalCtaEditor cta={cta} onChange={setCta} label="Primary CTA" />
        <OptionalCtaEditor cta={secondaryCta} onChange={setSecondaryCta} label="Secondary CTA" />
      </div>
      <div className="grid gap-5 rounded-md border border-[#e4d9dc] bg-[#fbf8f6] p-4">
        <PageSectionsEditor sections={sections} onChange={setSections} />
      </div>
      <SubmitButton state={state} />
      {state === "error" ? <p className="text-sm font-bold text-[#9f1239]">Save failed.</p> : null}
    </form>
  );
}

export function GalleryAlbumForm({ album }: { album?: GalleryAlbum | null }) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");
  const [coverImage, setCoverImage] = useState<EditableImage>({
    src: album?.coverImage || "",
    alt: album?.title || "Gallery cover image",
  });
  const [images, setImages] = useState<string[]>(album?.images || []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const form = new FormData(event.currentTarget);
    const response = await fetch(album ? `/api/admin/gallery/${album.id}` : "/api/admin/gallery", {
      method: album ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: album?.id,
        title: form.get("title"),
        description: form.get("description"),
        coverImage: coverImage.src,
        images,
        status: form.get("status"),
      }),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    router.push("/admin/gallery");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-md border border-[#e4d9dc] bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass()}>
          Album title
          <input name="title" required defaultValue={album?.title} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Status
          <select name="status" defaultValue={album?.status || "draft"} className={fieldClass()}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>
      <label className={labelClass()}>
        Description
        <textarea name="description" rows={4} defaultValue={album?.description} className={`${fieldClass()} py-3`} />
      </label>
      <ImageEditor image={coverImage} onChange={setCoverImage} label="Cover image" />
      <ImageEditor
        image={{ src: "", alt: "" }}
        onChange={(image) => {
          if (image.src.startsWith("/api/media/")) {
            setImages((current) => (current.includes(image.src) ? current : [...current, image.src]));
          }
        }}
        label="Add gallery image"
      />
      <label className={labelClass()}>
        Gallery image paths or URLs, one per line
        <textarea name="images" rows={8} value={images.join("\n")} onChange={(event) => setImages(splitLines(event.target.value))} className={`${fieldClass()} py-3`} />
      </label>
      <SubmitButton state={state} />
      {state === "error" ? <p className="text-sm font-bold text-[#9f1239]">Save failed.</p> : null}
    </form>
  );
}

export function SettingsForm({ settings }: { settings: CmsSettings }) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: form.get("siteName"),
        tagline: form.get("tagline"),
        contactEmail: form.get("contactEmail"),
        announcement: form.get("announcement"),
        primaryCtaLabel: form.get("primaryCtaLabel"),
        primaryCtaHref: form.get("primaryCtaHref"),
      }),
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    router.refresh();
    setState("idle");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-md border border-[#e4d9dc] bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass()}>
          Site name
          <input name="siteName" required defaultValue={settings.siteName} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Tagline
          <input name="tagline" required defaultValue={settings.tagline} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Contact email
          <input name="contactEmail" type="email" required defaultValue={settings.contactEmail} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Primary CTA link
          <input name="primaryCtaHref" required defaultValue={settings.primaryCtaHref} className={fieldClass()} />
        </label>
        <label className={labelClass()}>
          Primary CTA label
          <input name="primaryCtaLabel" required defaultValue={settings.primaryCtaLabel} className={fieldClass()} />
        </label>
      </div>
      <label className={labelClass()}>
        Site announcement
        <textarea name="announcement" rows={4} defaultValue={settings.announcement} className={`${fieldClass()} py-3`} />
      </label>
      <SubmitButton state={state} />
      {state === "error" ? <p className="text-sm font-bold text-[#9f1239]">Save failed.</p> : null}
    </form>
  );
}
