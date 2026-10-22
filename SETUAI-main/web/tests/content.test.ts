import { describe, expect, it } from "vitest";
import { fallbackSiteContent } from "@/content/editable-site";
import {
  defaultInitiatives,
  newRecommendation,
  publishedRecommendations,
} from "@/content/initiatives";
import {
  mergeInitiatives,
  publicSiteContent,
  validateInitiatives,
} from "@/lib/initiative-content";
import { mergeSiteContent } from "@/lib/cms";

describe("CMS content compatibility", () => {
  it("migrates old published overrides without losing unrelated edits or empty collections", () => {
    const old = structuredClone(fallbackSiteContent);
    old.contentVersion = "launched-2026-08";
    old.home.hero.title = "Old launch headline";
    old.home.intro.body = ["An editor’s custom mission paragraph"];
    old.home.hero.image.src = "/api/media/custom-photo";
    old.global.logo.src = "/api/media/custom-logo";
    old.global.footerColumns = [
      {
        title: "Custom",
        links: [{ label: "Our custom page", href: "/custom" }],
      },
    ];
    old.global.navigation.push({ label: "Custom", href: "/custom" });
    old.visuals.motionEnabled = false;
    old.initiatives.recommendations = [];
    const result = mergeSiteContent(old);
    expect(result.home.hero.title).toBe("SetuAI");
    expect(result.home.intro.body).toEqual(old.home.intro.body);
    expect(result.home.hero.image.src).toBe("/api/media/custom-photo");
    expect(result.global.logo.src).toBe("/api/media/custom-logo");
    expect(result.global.footerColumns[0].links).toContainEqual({
      label: "Our custom page",
      href: "/custom",
    });
    expect(result.global.navigation).toContainEqual({
      label: "Custom",
      href: "/custom",
    });
    expect(result.visuals.motionEnabled).toBe(false);
    expect(result.initiatives.recommendations).toEqual([]);
    expect(result.global.email).toBe("setuai.edu@gmail.com");
  });
  it("restores the original hero without resetting the content-update release", () => {
    const saved = structuredClone(fallbackSiteContent);
    saved.contentVersion = "literacy-2026-10";
    saved.home.hero.title =
      "Building an AI-literate future, one learner at a time.";
    saved.home.hero.image.src = "/api/media/approved-classroom";
    saved.home.intro.body = ["Editor-approved introduction"];
    saved.home.textbook.title = "Editor-approved textbook title";
    saved.global.navCta = { label: "Custom action", href: "/contact" };
    saved.seo.homeTitle = "Editor-approved metadata";
    saved.initiatives.platform.title = "Editor-approved beta title";
    saved.visuals.motionEnabled = false;
    const result = mergeSiteContent(saved);
    expect(result.home.hero).toEqual({
      ...fallbackSiteContent.home.hero,
      image: saved.home.hero.image,
    });
    expect(result.home.intro).toEqual(saved.home.intro);
    expect(result.home.textbook).toEqual(saved.home.textbook);
    expect(result.home.stats).toEqual(saved.home.stats);
    expect(result.global).toEqual(saved.global);
    expect(result.seo).toEqual(saved.seo);
    expect(result.initiatives).toEqual(saved.initiatives);
    expect(result.visuals).toEqual(saved.visuals);
  });
  it("preserves current-version edits and fills missing new fields", () => {
    const saved = structuredClone(fallbackSiteContent);
    saved.home.hero.title = "Editor-approved headline";
    saved.initiatives.platform.title = "Editor-approved platform title";
    expect(mergeSiteContent(saved).home.hero.title).toBe(
      "Editor-approved headline",
    );
    expect(mergeSiteContent(saved).initiatives.platform.title).toBe(
      "Editor-approved platform title",
    );
    expect(
      mergeInitiatives({
        platform: { url: "https://example.org" },
        recommendations: [],
      }).platform.betaOpen,
    ).toBe(true);
    expect(mergeInitiatives({ recommendations: [] }).recommendations).toEqual(
      [],
    );
  });
  it("keeps drafts, pending approvals, and private provenance out of public payloads", () => {
    const content = structuredClone(fallbackSiteContent);
    content.initiatives.recommendations.push({
      ...newRecommendation,
      id: "private",
      organization: "PRIVATE",
      excerpt: "PRIVATE",
      status: "published",
      approval: "pending",
    });
    const projected = publicSiteContent(content);
    expect(JSON.stringify(projected)).not.toContain("PRIVATE");
    expect(
      projected.initiatives.recommendations.every(
        (item) => item.sourceDocument === "",
      ),
    ).toBe(true);
    expect(publishedRecommendations(content.initiatives)).toHaveLength(4);
  });
  it("rejects unsafe destinations and incomplete section order", () => {
    const work = structuredClone(defaultInitiatives);
    work.textbook.sampleUrl = "javascript:alert(1)";
    work.homeOrder = ["textbook"];
    expect(validateInitiatives(work)).toHaveLength(2);
  });
});
