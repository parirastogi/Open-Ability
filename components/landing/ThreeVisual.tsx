'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// Particle Field Component
function ParticleField({ count = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#10b981"
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

// 3D Nodes Network Component
function NodesNetwork({ speedMultiplier = 1 }: { speedMultiplier: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Generate nodes representing Skills, Careers, AI, Accessibility, Opportunity
  const nodes = [
    { id: 'skills', position: new THREE.Vector3(-1.8, 1.0, 0.5), label: 'Skills', color: '#06b6d4', size: 0.2 },
    { id: 'accessibility', position: new THREE.Vector3(1.5, -1.2, 1.0), label: 'Accessibility', color: '#f59e0b', size: 0.2 },
    { id: 'career', position: new THREE.Vector3(1.6, 1.2, -0.8), label: 'Career', color: '#3b82f6', size: 0.2 },
    { id: 'opportunity', position: new THREE.Vector3(-1.4, -1.3, -0.6), label: 'Opportunity', color: '#10b981', size: 0.2 },
    { id: 'ai', position: new THREE.Vector3(0.0, 2.0, -0.4), label: 'AI Engine', color: '#10b981', size: 0.18 },
    { id: 'comm', position: new THREE.Vector3(-0.8, -2.1, 0.8), label: 'Communication', color: '#f59e0b', size: 0.18 },
  ];

  // Mouse Parallax effect & slow rotation
  useFrame((state) => {
    if (groupRef.current) {
      // Base auto rotation
      const elapsed = state.clock.getElapsedTime();
      const baseRotationY = elapsed * 0.15 * speedMultiplier;
      
      // Interpolate with cursor position (parallax)
      const targetRotationY = baseRotationY + (state.pointer.x * 0.25);
      const targetRotationX = (state.pointer.y * 0.2) + (Math.sin(elapsed * 0.08) * 0.05 * speedMultiplier);
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      
      {/* Central Abstract Human Shape (Candidate Career Ecosystem) */}
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Torso/Body (Concentric glass-like rings) */}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          transparent
          opacity={0.5}
          roughness={0.1}
        />
      </mesh>
      
      {/* Glowing core sphere */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#10b981"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Floating Surrounding Nodes */}
      {nodes.map((node) => {
        const isHovered = hoveredNode === node.id;
        return (
          <mesh
            key={node.id}
            position={node.position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNode(node.id);
            }}
            onPointerOut={() => setHoveredNode(null)}
          >
            <sphereGeometry args={[node.size * (isHovered ? 1.25 : 1), 32, 32]} />
            <meshStandardMaterial
              color={isHovered ? '#ffffff' : node.color}
              emissive={node.color}
              emissiveIntensity={isHovered ? 1.0 : 0.6}
              roughness={0.1}
              metalness={0.2}
            />
            {/* Always visible clean labels for major nodes */}
            <Html distanceFactor={6} position={[0, node.size + 0.25, 0]} center>
              <div className={`px-2 py-1 rounded-md text-[10px] font-extrabold tracking-tight border transition-all duration-200 pointer-events-none select-none ${
                isHovered
                  ? 'bg-white text-slate-950 border-white scale-110 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-950/85 text-slate-200 border-slate-800'
              }`}>
                {node.label}
              </div>
            </Html>
          </mesh>
        );
      })}

      {/* Pulsing connection lines to the central head and core */}
      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          {/* Connector to Head */}
          <Line
            points={[new THREE.Vector3(0, 0.6, 0), node.position]}
            color="#10b981"
            lineWidth={1.2}
            opacity={hoveredNode === node.id ? 0.7 : 0.25}
            transparent
          />
          {/* Connector to Core */}
          <Line
            points={[new THREE.Vector3(0, -0.1, 0), node.position]}
            color="#3b82f6"
            lineWidth={1}
            opacity={hoveredNode === node.id ? 0.6 : 0.15}
            transparent
          />
        </React.Fragment>
      ))}

      {/* Inter-node connecting paths */}
      <Line points={[nodes[0].position, nodes[4].position]} color="#06b6d4" lineWidth={0.8} opacity={0.15} transparent />
      <Line points={[nodes[1].position, nodes[5].position]} color="#f59e0b" lineWidth={0.8} opacity={0.15} transparent />
      <Line points={[nodes[2].position, nodes[3].position]} color="#3b82f6" lineWidth={0.8} opacity={0.15} transparent />
    </group>
  );
}

export default function ThreeVisual() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if WebGL is supported
    let support = true;
    try {
      const canvas = document.createElement('canvas');
      support = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      support = false;
    }

    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReduced = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    // Update states asynchronously to prevent synchronous cascading render warnings
    const timer = setTimeout(() => {
      setHasWebGL(support);
      setPrefersReducedMotion(isReduced);
      setMounted(true);
    }, 0);

    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  if (!mounted) {
    return <div className="w-full h-[320px] sm:h-[450px] bg-slate-950/20" />;
  }

  // Graceful Fallback if WebGL is unavailable or reduced motion is preferred
  if (!hasWebGL) {
    return (
      <div className="w-full h-[350px] sm:h-[480px] flex items-center justify-center relative overflow-hidden">
        {/* Animated Vector Map representing connection */}
        <svg className="w-full h-full p-6 max-w-sm text-emerald-400" viewBox="0 0 200 200" fill="none">
          {/* Central human shape abstract */}
          <circle cx="100" cy="80" r="16" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="2.5" />
          <ellipse cx="100" cy="130" rx="30" ry="12" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="100" cy="100" r="4" fill="#ffffff" />

          {/* Lines */}
          <line x1="100" y1="90" x2="35" y2="55" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="100" y1="90" x2="165" y2="60" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="100" y1="90" x2="50" y2="155" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="100" y1="90" x2="155" y2="145" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Node bubbles */}
          <circle cx="35" cy="55" r="9" fill="#06b6d4" />
          <circle cx="165" cy="60" r="11" fill="#3b82f6" />
          <circle cx="50" cy="155" r="10" fill="#f59e0b" />
          <circle cx="155" cy="145" r="9" fill="#10b981" />

          <text x="35" y="72" textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight="bold">Skills</text>
          <text x="165" y="45" textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight="bold">Career</text>
          <text x="50" y="172" textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight="bold">Accessibility</text>
          <text x="155" y="130" textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight="bold">Opportunity</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] sm:h-[480px] relative overflow-hidden flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 52 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.8} />
        <pointLight position={[8, 8, 8]} intensity={1.8} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <ParticleField count={80} />
        <NodesNetwork speedMultiplier={prefersReducedMotion ? 0 : 1} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
