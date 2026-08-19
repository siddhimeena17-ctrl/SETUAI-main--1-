"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { EditableSiteContent } from "@/content/editable-site";
import { KnowledgeVisualFallback } from "@/components/knowledge-visual-fallback";

type MissionHeartbeatProps = {
  label: string;
  density?: EditableSiteContent["visuals"]["visualDensity"];
  enabled?: boolean;
};

function seeded(index: number) {
  const value = Math.sin(index * 928.37) * 10000;
  return value - Math.floor(value);
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments) {
      object.geometry.dispose();
      const material = object.material;

      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else {
        material.dispose();
      }
    }
  });
}

export function MissionHeartbeat({ label, density = "active", enabled = true }: MissionHeartbeatProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const mountElement: HTMLDivElement = mount;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      mountElement.dataset.webgl = "unavailable";
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.setAttribute("aria-hidden", "true");
    mountElement.appendChild(renderer.domElement);
    mountElement.dataset.webgl = "ready";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.2, 9.2);

    const root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const keyLight = new THREE.DirectionalLight(0xfff0d0, 2.4);
    keyLight.position.set(2.8, 4.2, 5);
    scene.add(keyLight);
    const tealLight = new THREE.PointLight(0x53d6ce, 18, 12);
    tealLight.position.set(-2.4, -1.5, 3.4);
    scene.add(tealLight);

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 1.15);
    heartShape.bezierCurveTo(-0.2, 1.8, -1.7, 2.4, -2.35, 1.08);
    heartShape.bezierCurveTo(-3.18, -0.58, -1.28, -2.16, 0, -3.08);
    heartShape.bezierCurveTo(1.28, -2.16, 3.18, -0.58, 2.35, 1.08);
    heartShape.bezierCurveTo(1.7, 2.4, 0.2, 1.8, 0, 1.15);

    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.34,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    heartGeometry.center();

    const heartMaterial = new THREE.MeshStandardMaterial({
      color: 0xf36f56,
      emissive: 0x5b211e,
      emissiveIntensity: 0.34,
      metalness: 0.08,
      roughness: 0.34,
      transparent: true,
      opacity: 0.86,
    });
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    heart.scale.set(0.78, 0.78, 0.78);
    root.add(heart);

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xfff1bd,
      transparent: true,
      opacity: 0.7,
    });
    const heartEdges = new THREE.LineSegments(new THREE.EdgesGeometry(heartGeometry), edgeMaterial);
    heart.add(heartEdges);

    const ringGroup = new THREE.Group();
    root.add(ringGroup);
    const ringCount = density === "immersive" ? 5 : density === "active" ? 4 : 3;

    for (let index = 0; index < ringCount; index += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.35 + index * 0.34, 0.012, 8, 160),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? 0x62d9d2 : 0xffd86b,
          transparent: true,
          opacity: 0.34 - index * 0.035,
        }),
      );
      ring.rotation.x = Math.PI / 2.75 + index * 0.08;
      ring.rotation.y = -0.52 + index * 0.08;
      ringGroup.add(ring);
    }

    const signalGroup = new THREE.Group();
    root.add(signalGroup);
    const signalCount = density === "immersive" ? 28 : density === "active" ? 20 : 14;

    for (let index = 0; index < signalCount; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const startY = -2.8 + seeded(index + 1) * 5.4;
      const endY = -1.8 + seeded(index + 13) * 3.6;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * (4.7 + seeded(index + 4) * 0.7), startY, -0.5 + seeded(index + 2) * 1.2),
        new THREE.Vector3(side * (2.8 + seeded(index + 6) * 0.5), startY * 0.38, 0.9 + seeded(index + 7) * 0.8),
        new THREE.Vector3(side * (1.15 + seeded(index + 9) * 0.7), endY, 0.3 + seeded(index + 11) * 0.9),
      ]);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(34));
      const material = new THREE.LineBasicMaterial({
        color: index % 3 === 0 ? 0xf8d66d : 0x8ff3ec,
        transparent: true,
        opacity: 0.18 + seeded(index + 21) * 0.22,
      });
      signalGroup.add(new THREE.Line(geometry, material));
    }

    const pageGroup = new THREE.Group();
    root.add(pageGroup);
    const pageMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff2dd,
      side: THREE.DoubleSide,
      metalness: 0.02,
      roughness: 0.48,
      transparent: true,
      opacity: 0.68,
    });

    [-1, 1].forEach((side) => {
      const page = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 2.35, 8, 8), pageMaterial.clone());
      page.position.set(side * 0.82, -1.35, -0.32);
      page.rotation.set(-0.56, side * 0.18, side * -0.48);
      pageGroup.add(page);
    });

    function resize() {
      const width = Math.max(1, mountElement.clientWidth || 1);
      const height = Math.max(1, mountElement.clientHeight || 1);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.z = width < 560 ? 11.6 : 9.2;
      root.position.y = width < 560 ? -0.15 : 0;
      camera.updateProjectionMatrix();
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mountElement);

    let frame = 0;
    let visible = true;
    const beatStrength = density === "immersive" ? 0.12 : density === "active" ? 0.085 : 0.055;
    const pointer = { x: 0, y: 0, burst: 0 };

    function onPointerMove(event: PointerEvent) {
      const rect = mountElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
    }

    function onPointerLeave() {
      pointer.x = 0;
      pointer.y = 0;
    }

    function onPointerDown() {
      pointer.burst = 1;
    }

    mountElement.addEventListener("pointermove", onPointerMove);
    mountElement.addEventListener("pointerleave", onPointerLeave);
    mountElement.addEventListener("pointerdown", onPointerDown);

    function render(time = 0) {
      if (document.hidden || !visible) {
        frame = 0;
        return;
      }

      const seconds = time * 0.001;
      pointer.burst *= 0.9;
      const beat = 1 + Math.pow(Math.max(0, Math.sin(seconds * 3.18)), 5) * beatStrength + pointer.burst * 0.075;
      heart.scale.setScalar(0.78 * beat);
      heart.rotation.z = Math.sin(seconds * 0.72) * 0.018 + pointer.x * 0.025;
      ringGroup.rotation.z = seconds * 0.08 + pointer.x * 0.12;
      signalGroup.rotation.y = Math.sin(seconds * 0.42) * 0.16 + pointer.x * 0.18;
      pageGroup.rotation.z = Math.sin(seconds * 0.9) * 0.018;
      root.rotation.y = Math.sin(seconds * 0.34) * 0.17 + pointer.x * 0.24;
      root.rotation.x = Math.sin(seconds * 0.29) * 0.05 + pointer.y * 0.14;

      ringGroup.children.forEach((ring, index) => {
        const pulse = 1 + Math.sin(seconds * 1.8 + index * 0.68) * 0.035;
        ring.scale.setScalar(pulse);
      });

      renderer.render(scene, camera);

      if (enabled && !reducedMotion && visible && !document.hidden) {
        frame = window.requestAnimationFrame(render);
      }
    }

    function startAnimation() {
      if (!reducedMotion && enabled && visible && !document.hidden && !frame) {
        frame = window.requestAnimationFrame(render);
      }
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) startAnimation();
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(mountElement);
    const onDocumentVisibility = () => startAnimation();
    document.addEventListener("visibilitychange", onDocumentVisibility);

    if (reducedMotion || !enabled) render();
    else startAnimation();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onDocumentVisibility);
      mountElement.removeEventListener("pointermove", onPointerMove);
      mountElement.removeEventListener("pointerleave", onPointerLeave);
      mountElement.removeEventListener("pointerdown", onPointerDown);
      delete mountElement.dataset.webgl;
      disposeScene(scene);
      pageMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [density, enabled, label]);

  return (
    <div
      ref={mountRef}
      role="img"
      aria-label={label}
      className="mission-heartbeat-canvas min-h-[22rem] w-full max-w-full min-w-0 sm:aspect-[1/0.78] sm:min-h-96"
    >
      <KnowledgeVisualFallback variant="heartbeat" />
    </div>
  );
}
