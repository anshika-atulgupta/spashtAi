'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Individual bubble that floats and reacts to mouse ───────────────────────
function Bubbles({ count = 120 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, mouse } = useThree();

  // Pre-generate stable per-bubble state
  const bubbleData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008 + 0.003, // gentle upward drift
        0
      ),
      scale: Math.random() * 0.28 + 0.06,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mouseWorld = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();

    // Convert normalised mouse [-1,1] to world coords
    mouseWorld.current.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0
    );

    bubbleData.forEach((b, i) => {
      // Gentle float
      b.position.add(b.velocity);
      b.position.x += Math.sin(t * 0.3 + b.phase) * 0.003;

      // Wrap around when off-screen
      if (b.position.y > 7) b.position.y = -7;
      if (b.position.x > 10) b.position.x = -10;
      if (b.position.x < -10) b.position.x = 10;

      // Cursor repulsion
      const dx = b.position.x - mouseWorld.current.x;
      const dy = b.position.y - mouseWorld.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const REPEL_RADIUS = 2.2;
      if (dist < REPEL_RADIUS && dist > 0.01) {
        const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.06;
        b.position.x += (dx / dist) * force;
        b.position.y += (dy / dist) * force;
      }

      dummy.position.copy(b.position);
      dummy.scale.setScalar(b.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshPhysicalMaterial
        color="#a8d8ff"
        transparent
        opacity={0.18}
        roughness={0}
        metalness={0}
        transmission={0.92}
        ior={1.33}
        thickness={0.5}
        envMapIntensity={1}
      />
    </instancedMesh>
  );
}

// ─── Slow rotating faint grid lines for depth ────────────────────────────────
function GridLines() {
  const ref = useRef<THREE.LineSegments>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.03;
      ref.current.rotation.x = clock.getElapsedTime() * 0.015;
    }
  });

  const geometry = useMemo(() => {
    const size = 20;
    const divisions = 14;
    const step = size / divisions;
    const half = size / 2;
    const points: number[] = [];

    for (let i = 0; i <= divisions; i++) {
      const pos = -half + i * step;
      // horizontal
      points.push(-half, pos, 0, half, pos, 0);
      // vertical
      points.push(pos, -half, 0, pos, half, 0);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, []);

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#334155" transparent opacity={0.15} />
    </lineSegments>
  );
}

// ─── Exported canvas wrapper ─────────────────────────────────────────────────
export default function BubbleField() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} color="#94cbff" />
        <directionalLight position={[6, 8, 4]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-6, -4, 3]} intensity={0.6} color="#7c9fff" />

        <GridLines />
        <Bubbles count={130} />
      </Canvas>
    </div>
  );
}
