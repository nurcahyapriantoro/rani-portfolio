'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { seededRandom } from '@/lib/seeded-random';

interface FloatingElement {
  position: [number, number, number];
  size: number;
  speed: number;
  type: 'atom' | 'helix-segment' | 'molecule' | 'bond';
  rotationSpeed?: number;
  phase?: number;
  seed: number;
}

const ATOM_COUNT = 60;

function generateElements(): FloatingElement[] {
  const elements: FloatingElement[] = [];
  let seedCounter = 1;

  for (let i = 0; i < ATOM_COUNT; i++) {
    const s = seedCounter++;
    const angle = seededRandom(s * 0.1) * Math.PI * 2;
    const radius = 4 + seededRandom(s * 0.2) * 8;
    const x = Math.cos(angle) * radius;
    const y = (seededRandom(s * 0.3) - 0.5) * 12;
    const z = -2 - seededRandom(s * 0.4) * 6;

    elements.push({
      position: [x, y, z],
      size: 0.04 + seededRandom(s * 0.5) * 0.12,
      speed: 0.2 + seededRandom(s * 0.6) * 0.5,
      type: 'atom',
      phase: seededRandom(s * 0.7) * Math.PI * 2,
      seed: s
    });
  }

  for (let i = 0; i < 12; i++) {
    const s = seedCounter++;
    const angle = seededRandom(s * 0.1) * Math.PI * 2;
    const radius = 5 + seededRandom(s * 0.2) * 6;
    const x = Math.cos(angle) * radius;
    const y = (seededRandom(s * 0.3) - 0.5) * 10;
    const z = -1 - seededRandom(s * 0.4) * 4;

    elements.push({
      position: [x, y, z],
      size: 0.08 + seededRandom(s * 0.5) * 0.06,
      speed: 0.15 + seededRandom(s * 0.6) * 0.3,
      type: 'helix-segment',
      rotationSpeed: 0.2 + seededRandom(s * 0.7) * 0.4,
      phase: seededRandom(s * 0.8) * Math.PI * 2,
      seed: s
    });
  }

  for (let i = 0; i < 8; i++) {
    const s = seedCounter++;
    const angle = seededRandom(s * 0.1) * Math.PI * 2;
    const radius = 6 + seededRandom(s * 0.2) * 4;
    const x = Math.cos(angle) * radius;
    const y = (seededRandom(s * 0.3) - 0.5) * 10;
    const z = -3 - seededRandom(s * 0.4) * 3;

    elements.push({
      position: [x, y, z],
      size: 0.15 + seededRandom(s * 0.5) * 0.1,
      speed: 0.1 + seededRandom(s * 0.6) * 0.2,
      type: 'molecule',
      rotationSpeed: 0.1 + seededRandom(s * 0.7) * 0.3,
      phase: seededRandom(s * 0.8) * Math.PI * 2,
      seed: s
    });
  }

  for (let i = 0; i < 15; i++) {
    const s = seedCounter++;
    const angle = seededRandom(s * 0.1) * Math.PI * 2;
    const radius = 4.5 + seededRandom(s * 0.2) * 7;
    const x = Math.cos(angle) * radius;
    const y = (seededRandom(s * 0.3) - 0.5) * 11;
    const z = -2 - seededRandom(s * 0.4) * 5;

    elements.push({
      position: [x, y, z],
      size: 0.3 + seededRandom(s * 0.5) * 0.3,
      speed: 0.2 + seededRandom(s * 0.6) * 0.3,
      type: 'bond',
      rotationSpeed: 0.15 + seededRandom(s * 0.7) * 0.4,
      phase: seededRandom(s * 0.8) * Math.PI * 2,
      seed: s
    });
  }

  return elements;
}

function Atom({ position, size, speed, phase = 0 }: FloatingElement) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.3;
    ref.current.rotation.x = t * 0.2;
    ref.current.rotation.y = t * 0.3;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color="#22c55e"
        emissive="#4ade80"
        emissiveIntensity={0.6}
        metalness={0.5}
        roughness={0.4}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

function HelixSegment({ position, size, speed, rotationSpeed = 0.3, phase = 0, seed = 1 }: FloatingElement) {
  const groupRef = useRef<THREE.Group>(null);
  const spheres = useMemo(() => {
    const arr = [];
    const turns = 1.5;
    const numPoints = 8;
    const radius = size * 1.5;
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * size * 3;
      arr.push({
        pos1: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
        pos2: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius] as [number, number, number]
      });
    }
    return arr;
  }, [size, seed]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.4;
    groupRef.current.rotation.y += rotationSpeed * 0.01;
  });

  return (
    <group ref={groupRef} position={position}>
      {spheres.map((s, i) => (
        <group key={i}>
          <mesh position={s.pos1}>
            <sphereGeometry args={[size * 0.35, 10, 10]} />
            <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
          <mesh position={s.pos2}>
            <sphereGeometry args={[size * 0.35, 10, 10]} />
            <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Molecule({ position, size, speed, rotationSpeed = 0.2, phase = 0, seed = 1 }: FloatingElement) {
  const groupRef = useRef<THREE.Group>(null);
  const atoms = useMemo(() => {
    const arr = [];
    const numAtoms = 4 + Math.floor(seededRandom(seed * 0.9) * 3);
    for (let i = 0; i < numAtoms; i++) {
      const angle = (i / numAtoms) * Math.PI * 2;
      const radius = size * 1.5;
      arr.push({
        pos: [Math.cos(angle) * radius, (seededRandom(seed * 0.3 + i) - 0.5) * size * 2, Math.sin(angle) * radius] as [number, number, number],
        size: size * (0.6 + seededRandom(seed * 0.5 + i) * 0.4)
      });
    }
    return arr;
  }, [size, seed]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.3;
    groupRef.current.rotation.x += rotationSpeed * 0.005;
    groupRef.current.rotation.y += rotationSpeed * 0.008;
  });

  return (
    <group ref={groupRef} position={position}>
      {atoms.map((atom, i) => (
        <mesh key={i} position={atom.pos}>
          <sphereGeometry args={[atom.size, 10, 10]} />
          <meshStandardMaterial color="#22c55e" emissive="#4ade80" emissiveIntensity={0.4} transparent opacity={0.65} />
        </mesh>
      ))}
      {atoms.map((atom, i) =>
        atoms.slice(i + 1).map((atom2, j) => {
          const start = new THREE.Vector3(...atom.pos);
          const end = new THREE.Vector3(...atom2.pos);
          const mid = start.clone().add(end).multiplyScalar(0.5);
          const dir = end.clone().sub(start);
          const len = dir.length();
          const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.clone().normalize()
          );
          return (
            <mesh key={`bond-${i}-${j}`} position={mid} quaternion={quat}>
              <cylinderGeometry args={[size * 0.08, size * 0.08, len, 6]} />
              <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.3} transparent opacity={0.5} />
            </mesh>
          );
        })
      )}
    </group>
  );
}

function Bond({ position, size, speed, rotationSpeed = 0.3, phase = 0 }: FloatingElement) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.4;
    ref.current.rotation.x += rotationSpeed * 0.008;
    ref.current.rotation.y += rotationSpeed * 0.005;
  });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[size, size * 0.15, 8, 24]} />
      <meshStandardMaterial color="#22c55e" emissive="#4ade80" emissiveIntensity={0.5} transparent opacity={0.6} />
    </mesh>
  );
}

function FloatingElement({ data }: { data: FloatingElement }) {
  switch (data.type) {
    case 'atom':
      return <Atom {...data} />;
    case 'helix-segment':
      return <HelixSegment {...data} />;
    case 'molecule':
      return <Molecule {...data} />;
    case 'bond':
      return <Bond {...data} />;
  }
}

function MouseParallax() {
  const { camera, mouse } = useThree();
  const initialZ = camera.position.z;

  useFrame(() => {
    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    camera.position.z = initialZ;
  });

  return null;
}

function Scene() {
  const elements = useMemo(() => generateElements(), []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#4ade80" />
      <pointLight position={[-5, -5, -3]} intensity={0.4} color="#16a34a" />
      <MouseParallax />
      {elements.map((el, i) => (
        <FloatingElement key={i} data={el} />
      ))}
    </>
  );
}

export function DNAScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 55 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}