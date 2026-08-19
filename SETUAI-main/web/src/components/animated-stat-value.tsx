"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function parseValue(value: string) {
  const match = value.match(/^([^0-9]*)([\d,.]+)(.*)$/);
  if (!match) return null;

  return {
    prefix: match[1] || "",
    number: Number(match[2].replace(/,/g, "")),
    suffix: match[3] || "",
    decimals: match[2].includes(".") ? match[2].split(".")[1].length : 0,
  };
}

function formatNumber(value: number, decimals: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function AnimatedStatValue({ value }: { value: string }) {
  const parsed = useMemo(() => parseValue(value), [value]);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!parsed) return;

    const parsedValue = parsed;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let start = 0;
    const duration = 1200;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        function tick(time: number) {
          if (!start) start = time;
          const progress = Math.min(1, (time - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const next = parsedValue.number * eased;
          setDisplay(`${parsedValue.prefix}${formatNumber(next, parsedValue.decimals)}${parsedValue.suffix}`);

          if (progress < 1) {
            frame = window.requestAnimationFrame(tick);
          } else {
            setDisplay(value);
          }
        }

        frame = window.requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.55 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [parsed, value]);

  return <span ref={ref}>{display}</span>;
}
