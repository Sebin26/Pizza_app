"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Image from "next/image";

// Suppress THREE.Clock deprecation warning from @react-three/fiber/three.js
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
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

// Individual components for the pizza 3D scene using a high-quality texture
function PizzaModel() {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let loadedTex: THREE.Texture | null = null;
    
    loader.load("/pizza1.png", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      loadedTex = tex;
      setTexture(tex);
    });

    return () => {
      if (loadedTex) {
        loadedTex.dispose();
      }
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Slow continuous rotation
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
      {/* 3D Crust / Pizza Base to give it realistic thickness */}
      <mesh position={[0, -0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.08, 64]} />
        <meshStandardMaterial 
          color="#c48a47" 
          roughness={0.8} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Pizza Face (Textured disc mapped with pizza1.png) */}
      {texture && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <circleGeometry args={[2.5, 64]} />
          <meshStandardMaterial 
            map={texture} 
            transparent={true} 
            roughness={0.5} 
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

// 2D Image Fallback if WebGL isn't available
function PizzaFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center relative p-8">
      <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-radial from-brand-orange/20 to-transparent shadow-2xl flex items-center justify-center animate-float relative select-none">
        <Image 
          src="/pizza1.png" 
          alt="3D Pizza"
          width={384}
          height={384}
          priority
          className="w-4/5 h-4/5 object-contain filter drop-shadow-2xl hover:rotate-12 transition-transform duration-700 ease-out"
        />
      </div>
      
      {/* Decorative Floating Shadows */}
      <div className="absolute bottom-4 w-48 h-5 bg-brand-dark/15 blur-md rounded-full scale-x-110 animate-pulse"></div>
    </div>
  );
}

export default function Pizza3D() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if WebGL is supported asynchronously to avoid synchronous setState inside useEffect warning
    const timer = setTimeout(() => {
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
    }, 0);
    return () => clearTimeout(timer);
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
