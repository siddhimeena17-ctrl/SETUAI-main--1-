import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ value: null as unknown }));
vi.mock("@upstash/redis", () => ({
  Redis: class {
    async get() {
      return state.value;
    }
    async set(_key: string, value: unknown) {
      state.value = value;
      return "OK";
    }
  },
}));
import { getSiteContent, saveSiteContent } from "@/lib/cms";
import { fallbackSiteContent } from "@/content/editable-site";
import { publicSiteContent } from "@/lib/initiative-content";
beforeEach(() => {
  state.value = null;
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://test.invalid");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-only");
});
it("round-trips edited initiative data through the existing CMS and public projection", async () => {
  const content = structuredClone(fallbackSiteContent);
  content.initiatives.platform.title = "Edited platform heading";
  content.initiatives.textbook.sampleUrl = "/api/media/approved-sample";
  content.initiatives.recommendations[0].status = "draft";
  content.initiatives.chapters.applicationsOpen = false;
  await saveSiteContent(content);
  const reloaded = await getSiteContent();
  expect(reloaded.initiatives.platform.title).toBe("Edited platform heading");
  expect(reloaded.initiatives.textbook.sampleUrl).toBe(
    "/api/media/approved-sample",
  );
  expect(reloaded.initiatives.chapters.applicationsOpen).toBe(false);
  expect(reloaded.initiatives.recommendations).toHaveLength(4);
  expect(publicSiteContent(reloaded).initiatives.recommendations).toHaveLength(
    3,
  );
});
