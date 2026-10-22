import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formTypes } from "@/content/form-fields";
import { formspreeForms, submitToFormspree } from "@/lib/formspree";
const provider = vi.fn();
const input = {
  formType: "chapter",
  name: "Setup test",
  email: "test@example.org",
  organization: "Test school",
  interest: "School",
  message: "Test",
  status: "new" as const,
  sourcePage: "/chapters",
  privacyAcknowledged: true,
  updatesOptIn: false,
  fields: { city: "Delhi", motivation: "Learning" },
};
beforeEach(() => {
  provider.mockReset();
  vi.stubGlobal("fetch", provider);
});
afterEach(() => vi.unstubAllGlobals());
describe("Formspree delivery", () => {
  it("routes every application type to its own verified endpoint and includes consent and reference fields", async () => {
    provider.mockImplementation(async () => Response.json({ ok: true }));
    for (const type of formTypes) {
      await submitToFormspree({ ...input, formType: type }, `routing-${type}`);
      const [url, options] = provider.mock.calls.at(-1)!;
      expect(url).toBe(`https://formspree.io/f/${formspreeForms[type]}`);
      expect(JSON.parse(options.body)).toMatchObject({
        email: "test@example.org",
        city: "Delhi",
        form_type: type,
        source_page: "/chapters",
        privacy_acknowledged: "yes",
        updates_requested: "no",
        submission_id: `inquiry-routing-${type}`,
      });
    }
    expect(new Set(Object.values(formspreeForms)).size).toBe(formTypes.length);
  });
  it("coalesces concurrent retries on the same server instance", async () => {
    provider.mockImplementation(async () => Response.json({ ok: true }));
    const receipts = await Promise.all([
      submitToFormspree(input, "concurrent"),
      submitToFormspree(input, "concurrent"),
    ]);
    expect(provider).toHaveBeenCalledTimes(1);
    expect(receipts.map((r) => r.duplicate)).toEqual([false, true]);
  });
  it("does not treat a challenge, HTML page, or provider error as a successful receipt", async () => {
    provider.mockResolvedValueOnce(
      Response.json({ next: "https://formspree.io/challenge" }),
    );
    await expect(submitToFormspree(input, "challenge")).rejects.toMatchObject({
      status: 502,
    });
    provider.mockResolvedValueOnce(new Response("<html>Error</html>"));
    await expect(submitToFormspree(input, "html")).rejects.toThrow();
    provider.mockResolvedValueOnce(
      Response.json({ error: "Over limit" }, { status: 429 }),
    );
    await expect(submitToFormspree(input, "limit")).rejects.toMatchObject({
      status: 429,
    });
  });
  it("allows a retry after provider failure without silently writing to another service", async () => {
    provider.mockRejectedValueOnce(new Error("Network unavailable"));
    await expect(submitToFormspree(input, "retry")).rejects.toThrow(
      "Network unavailable",
    );
    provider.mockResolvedValueOnce(Response.json({ ok: true }));
    expect(await submitToFormspree(input, "retry")).toMatchObject({
      duplicate: false,
    });
  });
});
