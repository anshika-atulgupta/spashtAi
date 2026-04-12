'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Uniformly spread star field ───────────────────────────────────────────────
function StarField({ count = 4000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Box distribution — fills entire visible space uniformly
      positions[i * 3]     = (Math.random() - 0.5) * 400;  // X: -200 to +200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;  // Y: -200 to +200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50; // Z: behind camera

      // Colour: mostly white/blue, occasional warm gold/orange
      const warm = Math.random() < 0.08;
      if (warm) {
        colors[i * 3]     = 1.0;
        colors[i * 3 + 1] = 0.82 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.55 + Math.random() * 0.15;
      } else {
        const b = 0.85 + Math.random() * 0.15;
        colors[i * 3]     = b * (0.88 + Math.random() * 0.12);
        colors[i * 3 + 1] = b * (0.90 + Math.random() * 0.10);
        colors[i * 3 + 2] = b;
      }
    }
    return { positions, colors };
  }, [count]);

  // Very slow drift — gives sense of floating in space
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.006;
      ref.current.rotation.x = clock.getElapsedTime() * 0.003;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.15} /* Much smaller base size */
        sizeAttenuation
        transparent
        opacity={0.88}
        depthWrite={false}
      />
    </points>
  );
}

// ── Milky Way — a diagonal band of denser stars ───────────────────────────────
function MilkyWayBand({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Diagonal band: x spans wide, y is narrow, z behind camera
      const t = (Math.random() - 0.5) * 400;          // along the band
      const spread = (Math.random() - 0.5) * 55;      // band width
      const angle = Math.PI / 5;                      // tilt ~36°

      positions[i * 3]     = t;
      positions[i * 3 + 1] = spread + t * Math.tan(angle);
      positions[i * 3 + 2] = -30 - Math.random() * 60;

      // Blend warm core + cool arms
      const core = Math.abs(spread) < 12;
      if (core) {
        colors[i * 3]     = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 1] = 0.78 + Math.random() * 0.12;
        colors[i * 3 + 2] = 0.45 + Math.random() * 0.15;
      } else {
        colors[i * 3]     = 0.65 + Math.random() * 0.25;
        colors[i * 3 + 1] = 0.75 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.92 + Math.random() * 0.08;
      }
    }
    return { positions, colors };
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.004;
      ref.current.rotation.z = clock.getElapsedTime() * 0.002;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.12} /* Much smaller core sizes */
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </points>
  );
}

// ── A handful of large "bright star" sprites ─────────────────────────────────
function BrightStars({ count = 20 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 360;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 360;
      arr[i * 3 + 2] = -20 - Math.random() * 60;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      // Gentle twinkle via opacity
      (ref.current.material as THREE.PointsMaterial).opacity =
        0.5 + Math.sin(clock.getElapsedTime() * 1.8) * 0.3;
      ref.current.rotation.y = clock.getElapsedTime() * 0.006;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#cce4ff"
        size={0.6} /* Much smaller bright points */
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

// ── Canvas ────────────────────────────────────────────────────────────────────
export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 80, near: 0.1, far: 600 }}
        gl={{ antialias: false, alpha: false }}
        style={{ background: '#05040f' }}
      >
        <StarField count={4000} />
        <MilkyWayBand count={1500} />
        <BrightStars count={20} />
      </Canvas>
    </div>
  );
}
