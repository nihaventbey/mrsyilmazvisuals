"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { ResolvedHeroCard } from "@/lib/hero";

type ProgressRef = RefObject<number>;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function createPolaroidTexture(card: ResolvedHeroCard): Promise<THREE.CanvasTexture> {
  const w = 512;
  const h = 640;
  const border = 26;
  const bottom = 96;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#fdfaf4";
  ctx.fillRect(0, 0, w, h);

  const photoW = w - border * 2;
  const photoH = h - border - bottom;
  const [light, mid, dark] = card.palette;

  if (card.imageUrl) {
    try {
      const img = await loadImage(card.imageUrl);
      const scale = Math.max(photoW / img.width, photoH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = border + (photoW - drawW) / 2;
      const dy = border + (photoH - drawH) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(border, border, photoW, photoH);
      ctx.clip();
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();
    } catch {
      const gradient = ctx.createLinearGradient(border, border, w - border, photoH);
      gradient.addColorStop(0, light);
      gradient.addColorStop(0.55, mid);
      gradient.addColorStop(1, dark);
      ctx.fillStyle = gradient;
      ctx.fillRect(border, border, photoW, photoH);
    }
  } else {
    const gradient = ctx.createLinearGradient(border, border, w - border, photoH);
    gradient.addColorStop(0, light);
    gradient.addColorStop(0.55, mid);
    gradient.addColorStop(1, dark);
    ctx.fillStyle = gradient;
    ctx.fillRect(border, border, photoW, photoH);
  }

  const glow = ctx.createRadialGradient(
    border + photoW * 0.35,
    border + photoH * 0.3,
    20,
    border + photoW * 0.35,
    border + photoH * 0.3,
    photoW * 0.7,
  );
  glow.addColorStop(0, "rgba(255, 248, 230, 0.45)");
  glow.addColorStop(1, "rgba(255, 248, 230, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(border, border, photoW, photoH);

  ctx.fillStyle = "#5a4636";
  ctx.font = "italic 44px Georgia, 'Playfair Display', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(card.caption, w / 2, h - bottom / 2 - 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type CardTransform = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  startRot: THREE.Euler;
  endRot: THREE.Euler;
  stagger: number;
  floatSeed: number;
};

function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function buildTransforms(count: number): CardTransform[] {
  const golden = 2.399963;
  return Array.from({ length: count }, (_, i) => {
    // Same depth for start and end — cards slide in XY only, so layers never cross.
    const z = 0.15 - i * 0.12;

    const start = new THREE.Vector3(
      (seeded(i, 1) - 0.5) * 0.35,
      -1.25 + (seeded(i, 2) - 0.5) * 0.25,
      z,
    );
    // Face-on with in-plane twist; avoid pitch/yaw that would pierce neighbors.
    const startRot = new THREE.Euler(0, 0, (seeded(i, 3) - 0.5) * 0.45);

    const f = (i + 0.7) / count;
    const angle = i * golden;
    const radius = 1.15 + 4.5 * Math.sqrt(f);
    const end = new THREE.Vector3(
      Math.cos(angle) * radius * 1.32,
      Math.sin(angle) * radius * 0.6,
      z,
    );
    const endRot = new THREE.Euler(
      (seeded(i, 5) - 0.5) * 0.04,
      (seeded(i, 6) - 0.5) * 0.04,
      (seeded(i, 7) - 0.5) * 0.42,
    );

    return {
      start,
      end,
      startRot,
      endRot,
      stagger: (i / count) * 0.28,
      floatSeed: seeded(i, 8) * Math.PI * 2,
    };
  });
}

function PhotoCards({
  progressRef,
  cards,
  onReady,
}: {
  progressRef: ProgressRef;
  cards: ResolvedHeroCard[];
  onReady?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const transforms = useMemo(() => buildTransforms(cards.length), [cards.length]);
  const [textures, setTextures] = useState<THREE.CanvasTexture[]>([]);
  const readySent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    readySent.current = false;
    setTextures([]);

    Promise.all(cards.map((card) => createPolaroidTexture(card))).then((next) => {
      if (cancelled) {
        next.forEach((texture) => texture.dispose());
        return;
      }
      setTextures(next);
      if (!readySent.current) {
        readySent.current = true;
        onReady?.();
      }
    });

    return () => {
      cancelled = true;
    };
    // cards identity from server is stable per navigation; onReady is memoized.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  useEffect(() => {
    return () => {
      textures.forEach((texture) => texture.dispose());
    };
  }, [textures]);

  useFrame(({ clock }) => {
    if (!group.current || textures.length !== cards.length) return;
    const t = clock.elapsedTime;
    const progress = progressRef.current ?? 0;

    group.current.children.forEach((child, i) => {
      const tf = transforms[i];
      const p = smoothstep(tf.stagger, tf.stagger + 0.6, progress);

      child.position.lerpVectors(tf.start, tf.end, p);
      // Float only in screen axes — never nudge Z or the layers collide again.
      const idle = 1 - p * 0.65;
      child.position.x += Math.sin(t * 0.55 + tf.floatSeed) * 0.02 * idle;
      child.position.y +=
        Math.sin(t * 0.7 + tf.floatSeed) * 0.04 * idle +
        Math.sin(t * 0.4 + tf.floatSeed * 2) * 0.02 * p;

      child.rotation.set(
        THREE.MathUtils.lerp(tf.startRot.x, tf.endRot.x, p),
        THREE.MathUtils.lerp(tf.startRot.y, tf.endRot.y, p),
        THREE.MathUtils.lerp(tf.startRot.z, tf.endRot.z, p) +
          Math.sin(t * 0.35 + tf.floatSeed) * 0.015 * idle,
      );

      // Milder scale so large polaroids overlap less in depth.
      child.scale.setScalar(1 + p * 0.22);
      child.renderOrder = i;
    });
  });

  if (textures.length !== cards.length) return null;

  return (
    <group ref={group}>
      {transforms.map((_, i) => (
        <mesh
          key={cards[i].id}
          castShadow={false}
          receiveShadow={false}
          renderOrder={i}
        >
          <planeGeometry args={[1.45, 1.8125]} />
          <meshBasicMaterial
            map={textures[i]}
            toneMapped={false}
            depthWrite
            depthTest
            polygonOffset
            polygonOffsetFactor={-i}
            polygonOffsetUnits={-i}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ progressRef }: { progressRef: ProgressRef }) {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const progress = progressRef.current ?? 0;
    const targetZ = 6.4 + progress * 2.2;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.04;
    camera.position.y +=
      (pointer.y * 0.3 + progress * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Hero3D({
  progressRef,
  cards,
  onReady,
  onContextLost,
}: {
  progressRef: ProgressRef;
  cards: ResolvedHeroCard[];
  onReady?: () => void;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.4], fov: 46 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0 !z-0"
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          () => onContextLost?.(),
          { once: true },
        );
      }}
    >
      <ambientLight intensity={1} color="#fff6e6" />
      <PhotoCards progressRef={progressRef} cards={cards} onReady={onReady} />
      <Sparkles
        count={60}
        scale={[15, 9, 6]}
        size={2}
        speed={0.22}
        opacity={0.5}
        color="#e9d3a6"
      />
      <CameraRig progressRef={progressRef} />
    </Canvas>
  );
}
