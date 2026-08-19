"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { EditableVisualSettings } from "@/content/editable-site";
import { KnowledgeVisualFallback } from "@/components/knowledge-visual-fallback";

type AiLearningLatticeProps = {
  label: string;
  density: EditableVisualSettings["visualDensity"];
};

export function AiLearningLattice({ label, density }: AiLearningLatticeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => setIsDesktop(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);

    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const currentHost = hostRef.current;
    if (!currentHost) return;
    const hostElement: HTMLDivElement = currentHost;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.2, 7.5);

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      hostElement.dataset.webgl = "unavailable";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearAlpha(0);
    hostElement.appendChild(renderer.domElement);
    hostElement.dataset.webgl = "ready";

    const group = new THREE.Group();
    scene.add(group);

    const accent = new THREE.Color("#f5d45c");
    const cyan = new THREE.Color("#64d6d2");
    const white = new THREE.Color("#ffffff");
    const lineMaterial = new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.56 });
    const warmLineMaterial = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.7 });
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: white, transparent: true, opacity: 0.9, wireframe: true });
    const coreMaterial = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.86, wireframe: true });

    const nodeCount = density === "immersive" ? 18 : density === "active" ? 13 : 9;
    const nodes: THREE.Vector3[] = [];
    for (let index = 0; index < nodeCount; index += 1) {
      const angle = (index / nodeCount) * Math.PI * 2;
      const ring = index % 3;
      const radius = 1.15 + ring * 0.48;
      const z = (ring - 1) * 0.62 + Math.sin(angle * 2) * 0.18;
      nodes.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, z));
    }

    const pointPairs: number[] = [];
    nodes.forEach((node, index) => {
      const next = nodes[(index + 1) % nodes.length];
      const jump = nodes[(index + 4) % nodes.length];
      pointPairs.push(node.x, node.y, node.z, next.x, next.y, next.z);
      if (index % 2 === 0) pointPairs.push(node.x, node.y, node.z, jump.x, jump.y, jump.z);
    });

    const networkGeometry = new THREE.BufferGeometry();
    networkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pointPairs, 3));
    const network = new THREE.LineSegments(networkGeometry, lineMaterial);
    group.add(network);

    nodes.forEach((node, index) => {
      const geometry = index % 2 === 0 ? new THREE.OctahedronGeometry(0.075) : new THREE.TetrahedronGeometry(0.085);
      const mesh = new THREE.Mesh(geometry, nodeMaterial);
      mesh.position.copy(node);
      group.add(mesh);
    });

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), coreMaterial);
    group.add(core);

    const bookGroup = new THREE.Group();
    const pageMaterial = new THREE.MeshBasicMaterial({ color: white, transparent: true, opacity: 0.64, wireframe: true });
    const coverMaterial = new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.78, wireframe: true });
    const coverLeft = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.25, 0.045), coverMaterial);
    const coverRight = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.25, 0.045), coverMaterial);
    const pageStack = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.12, 0.035), pageMaterial);
    coverLeft.position.set(-0.48, -1.18, 0.34);
    coverRight.position.set(0.48, -1.18, 0.34);
    coverLeft.rotation.y = -0.34;
    coverRight.rotation.y = 0.34;
    pageStack.position.set(0, -1.18, 0.26);
    bookGroup.add(pageStack, coverLeft, coverRight);
    group.add(bookGroup);

    const ring = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.TorusGeometry(2.3, 0.01, 8, 72)), warmLineMaterial);
    ring.rotation.x = Math.PI / 2.7;
    group.add(ring);

    let raf = 0;
    let visible = true;
    const pointer = { x: 0, y: 0, burst: 0 };

    function resize() {
      const rect = hostElement.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    }

    function animate(time: number) {
      if (!visible || document.hidden) {
        raf = 0;
        return;
      }

      const t = time / 1000;
      pointer.burst *= 0.9;
      group.rotation.y = t * 0.2 + pointer.x * 0.35;
      group.rotation.x = Math.sin(t * 0.34) * 0.08 + pointer.y * 0.18;
      group.scale.setScalar(1 + pointer.burst * 0.035);
      core.rotation.x = t * 0.38;
      core.rotation.y = t * 0.26;
      core.scale.setScalar(1 + Math.sin(t * 2.6) * 0.045 + pointer.burst * 0.12);
      ring.rotation.z = t * 0.12;
      ring.scale.setScalar(1 + Math.sin(t * 1.8) * 0.03 + pointer.burst * 0.08);
      bookGroup.rotation.y = Math.sin(t * 0.5) * 0.18;
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (!reduceMotion && visible && !document.hidden && !raf) {
        raf = window.requestAnimationFrame(animate);
      }
    }

    function onPointerMove(event: PointerEvent) {
      const rect = hostElement.getBoundingClientRect();
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

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hostElement);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) startAnimation();
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(hostElement);
    const onDocumentVisibility = () => startAnimation();
    document.addEventListener("visibilitychange", onDocumentVisibility);
    hostElement.addEventListener("pointermove", onPointerMove);
    hostElement.addEventListener("pointerleave", onPointerLeave);
    hostElement.addEventListener("pointerdown", onPointerDown);
    if (reduceMotion) {
      group.rotation.set(-0.08, 0.28, 0);
      renderer.render(scene, camera);
    } else {
      startAnimation();
    }

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onDocumentVisibility);
      hostElement.removeEventListener("pointermove", onPointerMove);
      hostElement.removeEventListener("pointerleave", onPointerLeave);
      hostElement.removeEventListener("pointerdown", onPointerDown);
      if (raf) window.cancelAnimationFrame(raf);
      delete hostElement.dataset.webgl;
      if (hostElement.contains(renderer.domElement)) hostElement.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) object.geometry.dispose();
        if ("material" in object) {
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else if (material instanceof THREE.Material) material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [density, isDesktop]);

  return (
    <div
      ref={hostRef}
      className="ai-lattice-canvas"
      aria-label={label}
      role="img"
    >
      <KnowledgeVisualFallback variant="lattice" />
    </div>
  );
}
