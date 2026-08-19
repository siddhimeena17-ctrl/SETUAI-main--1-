"use client";

import { ArrowRight, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";

// react-leaflet uses window/document, so it must be loaded client-side only.
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

type Place = {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
  summary: string;
  focus: string;
};

const places: Place[] = [
  {
    id: "pennsylvania",
    name: "Pennsylvania",
    label: "North America hub",
    lat: 41.2033,
    lng: -77.1945,
    summary: "Our Pennsylvania hub.",
    focus: "Regional partner network",
  },
  {
    id: "ohio",
    name: "Ohio",
    label: "Regional partner network",
    lat: 40.4173,
    lng: -82.9071,
    summary: "Our Ohio hub.",
    focus: "Regional partner network",
  },
  {
    id: "delhi",
    name: "Delhi",
    label: "Our India hub",
    lat: 28.6139,
    lng: 77.209,
    summary: "Our Delhi hub.",
    focus: "Regional partner network",
  },
  {
    id: "noida",
    name: "Noida",
    label: "Implementation support",
    lat: 28.5355,
    lng: 77.391,
    summary:
      "Noida is central to product, ecosystem planning, and the operational support needed for trusted learning programs.",
    focus: "Implementation support",
  },
];

export function InteractiveMap() {
  const [activeId, setActiveId] = useState(places[0].id);

  // Center the map roughly between the US and India clusters on first render.
  const initialCenter = useMemo<[number, number]>(() => [28, 15], []);

  return (
    <section className="section-pad bg-[var(--color-surface)]">
      <div className="section-shell">
        <div className="motion-reveal" data-animate>
          <div className="flex items-center gap-3">
            <MapPin aria-hidden="true" className="text-[var(--color-coral)]" size={18} />
            <p className="section-kicker">Impact locations</p>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
            <div className="kinetic-card overflow-hidden border border-[var(--color-line)] bg-[var(--background)] p-4 sm:p-6">
              <div className="map-surface relative isolate overflow-hidden border border-[var(--color-line)]">
                <MapContainer
                  center={initialCenter}
                  zoom={2}
                  scrollWheelZoom={false}
                  style={{ height: "360px", width: "100%" }}
                  className="z-10"
                >
                  {/* Free OSM tiles. Swap the url/attribution for Mapbox, Stadia, etc. if you want a custom style. */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {places.map((place) => (
                    <MapPinMarker
                      key={place.id}
                      place={place}
                      active={activeId === place.id}
                      onSelect={() => setActiveId(place.id)}
                    />
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="grid gap-3">
              {places.map((place) => {
                const active = activeId === place.id;

                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setActiveId(place.id)}
                    onMouseEnter={() => setActiveId(place.id)}
                    className={[
                      "kinetic-card flex w-full flex-col items-start border p-4 text-left transition-colors sm:p-5",
                      active
                        ? "border-[var(--color-coral)] bg-[var(--color-deep)] text-stone-50"
                        : "border-[var(--color-line)] bg-[var(--background)] text-[var(--color-ink)]",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-lg font-normal tracking-tight">{place.name}</span>
                      <ArrowRight
                        aria-hidden="true"
                        size={16}
                        className={active ? "text-[var(--color-coral)]" : "text-[var(--color-muted)]"}
                      />
                    </div>
                    <span
                      className={[
                        "mt-2 text-xs font-medium uppercase tracking-[0.12em]",
                        active ? "text-[var(--color-coral)]" : "text-[var(--color-muted)]",
                      ].join(" ")}
                    >
                      {place.label}
                    </span>
                  </button>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Small wrapper so we can build a custom coral pin (matching your brand) with a
// Leaflet divIcon instead of the default blue marker image.
function MapPinMarker({
  place,
  active,
  onSelect,
}: {
  place: Place;
  active: boolean;
  onSelect: () => void;
}) {
  const [icon, setIcon] = useState<{ options: unknown } | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;

      const size = active ? 30 : 24;
      const html = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          background: ${active ? "#ec604b" : "#1c1917"};
          border: 2px solid white;
          transform: rotate(-45deg);
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        "></div>`;

      setIcon(
        L.divIcon({
          html,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
        })
      );
    });

    return () => {
      cancelled = true;
    };
  }, [active]);

  if (!icon) return null;

  return (
    <Marker
      position={[place.lat, place.lng]}
      icon={icon as any}
      eventHandlers={{ click: onSelect, mouseover: onSelect }}
    />
  );
}