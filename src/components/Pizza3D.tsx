"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Suppress THREE.Clock deprecation warning from @react-three/fiber/three.js
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }
    originalWarn(...args);
  };
}

// Individual components for the pizza 3D scene
function PizzaModel() {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  
  // Generate random positions for toppings to ensure consistent render
  const pepperoniPositions = useRef([
    [0.8, 0.11, 0.8],
    [-0.8, 0.11, -0.8],
    [0.9, 0.11, -0.5],
    [-0.5, 0.11, 0.9],
    [0, 0.11, 0.6],
    [0.4, 0.11, -0.9],
    [-0.9, 0.11, 0.2],
    [0, 0.11, -0.4],
    [-0.3, 0.11, -0.3],
    [0.5, 0.11, 0.2]
  ]);

  const basilPositions = useRef([
    [0.4, 0.11, 0.7],
    [-0.6, 0.11, 0.5],
    [0.5, 0.11, -0.6],
    [-0.4, 0.11, -0.7],
    [0.8, 0.11, 0.1],
    [-0.1, 0.11, -0.8]
  ]);

  const olivePositions = useRef([
    [0.6, 0.11, 0.5],
    [-0.5, 0.11, 0.3],
    [0.2, 0.11, -0.7],
    [-0.7, 0.11, -0.2],
    [0.7, 0.11, -0.2],
    [-0.2, 0.11, 0.8],
    [0.3, 0.11, 0.9],
    [-0.3, 0.11, -0.5]
  ]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Slow continuous rotation (local timer to avoid THREE.Clock deprecation)
    timeRef.current += delta;
    const time = timeRef.current;
    groupRef.current.rotation.y = time * 0.12;

    // Smooth tilt response based on mouse pointer
    const targetX = (state.pointer.y * Math.PI) / 8; // pitch
    const targetY = (state.pointer.x * Math.PI) / 8; // yaw

    // Smoothly interpolate (lerp)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetY, 0.05);
  });

  return (
    <group ref={groupRef}>
      {/* 1. Main Pizza Crust */}
      {/* Base thickness */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.15, 64]} />
        <meshStandardMaterial 
          color="#d29e62" 
          roughness={0.7} 
          metalness={0.1}
          bumpScale={0.05}
        />
      </mesh>
      
      {/* Puffed up crust rim - rotated on X-axis to lie flat on the pizza crust */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[2.4, 0.16, 24, 64]} />
        <meshStandardMaterial 
          color="#c48a47" 
          roughness={0.8} 
          metalness={0.05}
        />
      </mesh>

      {/* 2. Tomato Sauce Layer */}
      <mesh position={[0, 0.085, 0]} receiveShadow>
        <cylinderGeometry args={[2.25, 2.25, 0.03, 64]} />
        <meshStandardMaterial 
          color="#901a1e" 
          roughness={0.4} 
          metalness={0.1}
        />
      </mesh>

      {/* 3. Cheese Layer (melted look) */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.18, 2.18, 0.02, 64]} />
        <meshStandardMaterial 
          color="#fad054" 
          roughness={0.5} 
          metalness={0.0}
        />
      </mesh>
      
      {/* Extra cheese dollops to add dimension */}
      <mesh position={[0.5, 0.105, 0.3]} castShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.02, 32]} />
        <meshStandardMaterial color="#fcd974" roughness={0.4} />
      </mesh>
      <mesh position={[-0.4, 0.105, -0.4]} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.02, 32]} />
        <meshStandardMaterial color="#fcd974" roughness={0.4} />
      </mesh>

      {/* 4. Pepperonis (Classic Red discs) */}
      {pepperoniPositions.current.map((pos, idx) => (
        <mesh key={`pep-${idx}`} position={[pos[0], pos[1], pos[2]]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 32]} />
          <meshStandardMaterial 
            color="#7a0a0d" 
            roughness={0.3} 
            bumpScale={0.02}
          />
        </mesh>
      ))}

      {/* 5. Olives (Black rings - rotated on X-axis to lie flat) */}
      {olivePositions.current.map((pos, idx) => (
        <group key={`olive-${idx}`} position={[pos[0], pos[1], pos[2]]} rotation={[0, Math.random() * Math.PI, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.09, 0.04, 8, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 6. Basil Leaves (Green planes, slightly bent) */}
      {basilPositions.current.map((pos, idx) => (
        <mesh 
          key={`basil-${idx}`} 
          position={[pos[0], pos[1], pos[2]]} 
          rotation={[0.1, Math.random() * Math.PI, 0.15]}
          castShadow
        >
          <boxGeometry args={[0.28, 0.01, 0.14]} />
          <meshStandardMaterial 
            color="#2e7d32" 
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// 2D SVG Fallback if WebGL isn't available
function PizzaFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center relative p-8">
      <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-radial from-[#fad054] via-[#c48a47] to-[#901a1e]/10 shadow-2xl flex items-center justify-center animate-float relative select-none">
        {/* Visual crust outer line */}
        <div className="absolute inset-2 rounded-full border-8 border-dashed border-[#7a0a0d]/20 animate-spin-slow"></div>
        {/* Pizza Details inside SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-4/5 h-4/5 filter drop-shadow-md hover:rotate-12 transition-transform duration-700 ease-out"
        >
          {/* Pizza base */}
          <circle cx="50" cy="50" r="48" fill="#d29e62" stroke="#c48a47" strokeWidth="3" />
          {/* Sauce */}
          <circle cx="50" cy="50" r="41" fill="#901a1e" />
          {/* Cheese */}
          <circle cx="50" cy="50" r="39" fill="#fad054" />
          {/* Cheese highlight */}
          <circle cx="48" cy="46" r="30" fill="#fcd974" opacity="0.6" />
          
          {/* Toppings in 2D SVG */}
          {/* Pepperonis */}
          <circle cx="34" cy="36" r="6" fill="#7a0a0d" stroke="#5c0608" strokeWidth="0.5" />
          <circle cx="68" cy="40" r="6" fill="#7a0a0d" stroke="#5c0608" strokeWidth="0.5" />
          <circle cx="48" cy="68" r="6" fill="#7a0a0d" stroke="#5c0608" strokeWidth="0.5" />
          <circle cx="52" cy="28" r="6" fill="#7a0a0d" stroke="#5c0608" strokeWidth="0.5" />
          <circle cx="64" cy="62" r="6" fill="#7a0a0d" stroke="#5c0608" strokeWidth="0.5" />
          <circle cx="32" cy="60" r="6" fill="#7a0a0d" stroke="#5c0608" strokeWidth="0.5" />
          
          {/* Olives */}
          <circle cx="44" cy="48" r="2.5" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
          <circle cx="58" cy="52" r="2.5" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
          <circle cx="36" cy="50" r="2.5" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
          <circle cx="62" cy="28" r="2.5" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
          
          {/* Basil Leaves */}
          <path d="M 40,24 Q 45,20 42,16 Q 37,20 40,24" fill="#2e7d32" />
          <path d="M 58,68 Q 63,64 60,60 Q 55,64 58,68" fill="#2e7d32" />
          <path d="M 24,42 Q 29,38 26,34 Q 21,38 24,42" fill="#2e7d32" />
          <path d="M 72,52 Q 77,48 74,44 Q 69,48 72,52" fill="#2e7d32" />
        </svg>
      </div>
      
      {/* Decorative Floating Shadows */}
      <div className="absolute bottom-4 w-48 h-5 bg-brand-dark/15 blur-md rounded-full scale-x-110 animate-pulse"></div>
    </div>
  );
}

export default function Pizza3D() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setHasWebGL(support);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === null) {
    // Return empty placeholder while detecting
    return <div className="w-full h-full aspect-square max-w-md md:max-w-xl flex items-center justify-center" />;
  }

  if (!hasWebGL) {
    return (
      <div className="w-full h-full aspect-square max-w-md md:max-w-xl flex items-center justify-center">
        <PizzaFallback />
      </div>
    );
  }

  return (
    <div className="w-full h-full aspect-square max-w-md md:max-w-xl flex items-center justify-center relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [0, 4.5, 0], fov: 68 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Soft studio lights */}
        <ambientLight intensity={0.9} />
        
        {/* Warm key light */}
        <directionalLight 
          position={[6, 8, 4]} 
          intensity={2.2} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
          shadow-bias={-0.001}
        />
        
        {/* Rim light */}
        <pointLight position={[-6, 4, -4]} intensity={0.7} color="#fcd974" />
        
        {/* Fill light */}
        <directionalLight position={[0, -2, 0]} intensity={0.4} color="#901a1e" />

        <Center>
          <Float 
            speed={1.6} 
            rotationIntensity={0.2} 
            floatIntensity={0.25}
            floatingRange={[-0.15, 0.15]}
          >
            <PizzaModel />
          </Float>
        </Center>

        {/* Soft, beautiful shadows cast below the pizza */}
        <ContactShadows 
          position={[0, -0.6, 0]} 
          opacity={0.35} 
          scale={5.5} 
          blur={2.4} 
          far={3.0} 
        />
      </Canvas>
    </div>
  );
}
