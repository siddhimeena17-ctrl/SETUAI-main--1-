"use client";

import { useEffect } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SiteMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const preparedElements = new WeakSet<Element>();
    document.documentElement.classList.add("site-motion-ready");

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      document.documentElement.style.setProperty("--scroll-progress", String(clamp(progress, 0, 1)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    if (reduceMotion) {
      document.querySelectorAll("[data-animate]").forEach((element) => element.classList.add("is-visible"));

      return () => {
        window.removeEventListener("scroll", updateProgress);
        window.removeEventListener("resize", updateProgress);
        document.documentElement.classList.remove("site-motion-ready");
      };
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.removeAttribute("data-motion-prep");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    function prepareRevealElements(root: ParentNode = document) {
      root.querySelectorAll("[data-animate]").forEach((element, index) => {
        if (preparedElements.has(element)) return;
        preparedElements.add(element);

        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          const inView = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
          element.style.setProperty("--motion-delay", `${Math.min(index % 8, 7) * 70}ms`);

          if (inView) {
            element.classList.add("is-visible");
          } else {
            element.setAttribute("data-motion-prep", "true");
          }
        }

        revealObserver.observe(element);
      });
    }

    prepareRevealElements();

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.matches("[data-animate]")) {
              prepareRevealElements(node.parentElement || document);
            } else {
              prepareRevealElements(node);
            }
          }
        });
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const tiltElements = [...document.querySelectorAll<HTMLElement>("[data-tilt]")];

    function onPointerMove(event: PointerEvent) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      target.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
      target.style.setProperty("--tilt-glow-x", `${((x + 1) / 2) * 100}%`);
      target.style.setProperty("--tilt-glow-y", `${((y + 1) / 2) * 100}%`);
    }

    function onPointerLeave(event: PointerEvent) {
      const target = event.currentTarget as HTMLElement;
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
      target.style.setProperty("--tilt-glow-x", "50%");
      target.style.setProperty("--tilt-glow-y", "50%");
    }

    tiltElements.forEach((element) => {
      element.addEventListener("pointermove", onPointerMove);
      element.addEventListener("pointerleave", onPointerLeave);
    });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      revealObserver.disconnect();
      mutationObserver.disconnect();
      tiltElements.forEach((element) => {
        element.removeEventListener("pointermove", onPointerMove);
        element.removeEventListener("pointerleave", onPointerLeave);
      });
      document.documentElement.classList.remove("site-motion-ready");
    };
  }, []);

  return (
    <>
      <div className="site-scroll-progress" aria-hidden="true" />
      <div className="site-signal-layer" aria-hidden="true" />
    </>
  );
}
