'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const strand1Ref = useRef<THREE.Group>(null);
  const strand2Ref = useRef<THREE.Group>(null);

  const numPoints = 60;
  const radius = 1.4;
  const height = 14;
  const turns = 3;

  const { strand1Points, strand2Points } = useMemo(() => {
    const s1: THREE.Vector3[] = [];
    const s2: THREE.Vector3[] = [];
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      s1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      s2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }
    return { strand1Points: s1, strand2Points: s2 };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={strand1Ref}>
        {strand1Points.map((point, i) => (
          <mesh key={`s1-${i}`} position={point}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#16a34a"
              emissive="#16a34a"
              emissiveIntensity={0.4}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
      <group ref={strand2Ref}>
        {strand2Points.map((point, i) => (
          <mesh key={`s2-${i}`} position={point}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#4ade80"
              emissiveIntensity={0.4}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {strand1Points.map((p1, i) => {
        if (i % 3 !== 0) return null;
        const p2 = strand2Points[i];
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(p2, p1);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        return (
          <mesh key={`rung-${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.04, 0.04, len, 8]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.2}
              metalness={0.4}
              roughness={0.5}
            />
          </mesh>
        );
      })}

      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#4ade80" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#16a34a" />
    </group>
  );
}

export function DNAScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <DNAHelix />
    </Canvas>
  );
}