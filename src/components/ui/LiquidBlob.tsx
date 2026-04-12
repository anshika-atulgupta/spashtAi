'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Environment, Sphere, Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Blob() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Slowly revolve the entire sphere
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group position={[0, -1.8, 0]}>
      {/* Increased scale to make it large at the bottom */}
      <Sphere ref={meshRef} visible args={[1, 200, 200]} scale={2.5}>
        <MeshDistortMaterial
          color="#a2d2ff" // Very light bluish-white for pure water tint
          attach="material"
          distort={0.5} // slightly more distortion for water
          speed={2} // slightly faster wave ripples
          roughness={0} // completely smooth
          metalness={0.1} // very low metalness, pure glass/water
          transmission={1} // fully transmissive (like glass/water)
          ior={1.33} // index of refraction for water
          thickness={1.5} // adds realistic depth to the refraction
          transparent={true}
          opacity={1}
          envMapIntensity={1.5}
        />
      </Sphere>
    </group>
  );
}

export default function LiquidBlob() {
  return (
    <div className="absolute inset-0 z-0 select-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, 5, 2]} intensity={0.8} color="#00e5ff" />
        <pointLight position={[0, -2, 4]} intensity={2} color="#ffffff" />
        
        {/* Environment map is required for 'transmission' to reflect/refract something */}
        <Environment preset="city" />
        
        {/* Subtle background stars */}
        <Stars radius={100} depth={50} count={1000} factor={3} saturation={0} fade speed={0.5} />
        
        <Blob />
      </Canvas>
    </div>
  );
}
