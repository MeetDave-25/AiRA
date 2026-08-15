"use client";

import React, { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { RotateCw, Move, Shield, Radio } from "lucide-react";

interface WolfModelProps {
    onClick?: () => void;
}

// ══════════════════════════════════════════════════════════════════════
// PROCEDURAL 3D CYBER-WOLF MASCOT (MEVY) — 100% RELIABLE & ZERO-DEPENDENCY
// ══════════════════════════════════════════════════════════════════════
function CyberMevyProceduralModel({ onClick }: WolfModelProps) {
    const headGroup = useRef<THREE.Group>(null);
    const leftEar = useRef<THREE.Group>(null);
    const rightEar = useRef<THREE.Group>(null);
    const energyRing1 = useRef<THREE.Mesh>(null);
    const energyRing2 = useRef<THREE.Mesh>(null);
    const crestRef = useRef<THREE.Mesh>(null);
    const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    useEffect(() => {
        const handlePointerMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            mouse.current.targetX = x * 0.35;
            mouse.current.targetY = y * 0.25;
        };
        window.addEventListener("pointermove", handlePointerMove);
        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, []);

    const materials = useMemo(() => ({
        armorDark: new THREE.MeshStandardMaterial({ color: "#0a1128", roughness: 0.3, metalness: 0.85, flatShading: true }),
        armorLight: new THREE.MeshStandardMaterial({ color: "#1c2a4a", roughness: 0.35, metalness: 0.75, flatShading: true }),
        cyberCyan: new THREE.MeshStandardMaterial({ color: "#00f0ff", emissive: "#00f0ff", emissiveIntensity: 1.8, roughness: 0.1, metalness: 0.9 }),
        cyberPurple: new THREE.MeshStandardMaterial({ color: "#a855f7", emissive: "#a855f7", emissiveIntensity: 1.5, roughness: 0.2, metalness: 0.8 }),
        goldAccent: new THREE.MeshStandardMaterial({ color: "#fbbf24", emissive: "#d97706", emissiveIntensity: 0.6, roughness: 0.25, metalness: 0.9 }),
        glowEye: new THREE.MeshBasicMaterial({ color: "#38bdf8" }),
        wireframe: new THREE.MeshBasicMaterial({ color: "#38bdf8", wireframe: true, transparent: true, opacity: 0.3 }),
    }), []);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
        mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

        if (headGroup.current) {
            headGroup.current.position.y = Math.sin(time * 2) * 0.04;
            headGroup.current.rotation.y = -0.3 + mouse.current.x + Math.sin(time * 0.8) * 0.05;
            headGroup.current.rotation.x = 0.05 - mouse.current.y + Math.cos(time * 1.2) * 0.03;
        }
        if (leftEar.current) leftEar.current.rotation.z = 0.35 + Math.sin(time * 4) * 0.04;
        if (rightEar.current) rightEar.current.rotation.z = -0.35 - Math.cos(time * 3.5) * 0.04;
        materials.cyberCyan.emissiveIntensity = 1.4 + Math.sin(time * 3) * 0.4;
        if (crestRef.current) crestRef.current.rotation.y = time * 0.8;
        if (energyRing1.current) { energyRing1.current.rotation.z = time * 0.6; energyRing1.current.rotation.x = Math.PI / 3 + Math.sin(time * 0.5) * 0.2; }
        if (energyRing2.current) { energyRing2.current.rotation.z = -time * 0.4; energyRing2.current.rotation.y = Math.cos(time * 0.5) * 0.3; }
    });

    return (
        <group onClick={onClick}>
            <group ref={headGroup} position={[0, 0.15, 0]}>
                <mesh material={materials.armorDark} position={[0, 0.2, 0]}><dodecahedronGeometry args={[0.55, 0]} /></mesh>
                <mesh material={materials.wireframe} position={[0, 0.2, 0]}><dodecahedronGeometry args={[0.58, 0]} /></mesh>
                <mesh material={materials.armorLight} position={[-0.32, 0.05, 0.18]} rotation={[0.2, 0.3, -0.2]}><coneGeometry args={[0.28, 0.6, 4]} /></mesh>
                <mesh material={materials.armorLight} position={[0.32, 0.05, 0.18]} rotation={[0.2, -0.3, 0.2]}><coneGeometry args={[0.28, 0.6, 4]} /></mesh>
                <mesh material={materials.armorDark} position={[0, 0.02, 0.48]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.26, 0.65, 5]} /></mesh>
                <mesh material={materials.cyberCyan} position={[0, 0.01, 0.78]}><octahedronGeometry args={[0.08, 0]} /></mesh>
                <group position={[-0.24, 0.18, 0.38]}><mesh material={materials.cyberCyan}><boxGeometry args={[0.18, 0.06, 0.08]} /></mesh><pointLight color="#00f0ff" intensity={1.5} distance={0.8} /></group>
                <group position={[0.24, 0.18, 0.38]}><mesh material={materials.cyberCyan}><boxGeometry args={[0.18, 0.06, 0.08]} /></mesh><pointLight color="#00f0ff" intensity={1.5} distance={0.8} /></group>
                <group ref={leftEar} position={[-0.32, 0.65, -0.05]} rotation={[0.1, 0.2, 0.35]}><mesh material={materials.armorDark}><coneGeometry args={[0.18, 0.55, 3]} /></mesh></group>
                <group ref={rightEar} position={[0.32, 0.65, -0.05]} rotation={[0.1, -0.2, -0.35]}><mesh material={materials.armorDark}><coneGeometry args={[0.18, 0.55, 3]} /></mesh></group>
                <mesh ref={crestRef} material={materials.goldAccent} position={[0, 0.48, 0.3]}><octahedronGeometry args={[0.1, 0]} /></mesh>
            </group>
            <mesh ref={energyRing1} material={materials.cyberCyan} position={[0, 0.1, 0]}><torusGeometry args={[1.05, 0.015, 8, 48]} /></mesh>
            <mesh ref={energyRing2} material={materials.cyberPurple} position={[0, 0.1, 0]}><torusGeometry args={[1.2, 0.012, 8, 48]} /></mesh>
            <group position={[0, -0.85, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.7, 1.1, 32]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} /></mesh>
            </group>
        </group>
    );
}

function WolfGLBModel({ onClick }: WolfModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const pointerStart = useRef({ x: 0, y: 0, time: 0 });

    const handlePointerDown = (e: any) => {
        pointerStart.current = { x: e.clientX || e.touches?.[0]?.clientX || 0, y: e.clientY || e.touches?.[0]?.clientY || 0, time: Date.now() };
    };

    const handlePointerUp = (e: any) => {
        const clientX = e.clientX || e.changedTouches?.[0]?.clientX || 0;
        const clientY = e.clientY || e.changedTouches?.[0]?.clientY || 0;
        const dist = Math.hypot(clientX - pointerStart.current.x, clientY - pointerStart.current.y);
        const timeDiff = Date.now() - pointerStart.current.time;

        if (dist < 8 && timeDiff < 350) {
            if (groupRef.current) gsap.fromTo(groupRef.current.scale, { x: 0.92, y: 0.92, z: 0.92 }, { x: 1, y: 1, z: 1, duration: 0.55, ease: "elastic.out(1.2, 0.4)" });
            if (onClick) onClick();
        }
    };

    return (
        <group ref={groupRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
            <CyberMevyProceduralModel onClick={onClick} />
        </group>
    );
}

function JarvisHoloLoader() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-3xl z-20 select-none">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400/60 animate-spin [animation-duration:8s]" />
                <div className="absolute inset-5 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-sky-400 border-l-transparent animate-spin" />
                <div className="w-7 h-7 rounded-full bg-sky-400/20 backdrop-blur-sm border border-sky-400 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.8)]">
                    <Radio size={14} className="text-sky-300 animate-pulse" />
                </div>
            </div>
            <div className="mt-4 text-center">
                <p className="font-orbitron font-bold text-xs tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-purple-400 animate-pulse">
                    ACTIVATING MEVY 3D NEURAL WOLF
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>JARVIS PROTOCOL · READY</span>
                </div>
            </div>
        </div>
    );
}

export interface Wolf3DCanvasProps {
    onWolfClick?: () => void;
    interactive?: boolean;
    className?: string;
    showControls?: boolean;
}

export function Wolf3DCanvas({ onWolfClick, interactive = true, className = "w-full h-full min-h-[320px] sm:min-h-[420px]", showControls = true }: Wolf3DCanvasProps) {
    const [autoRotate, setAutoRotate] = useState(false);
    const controlsRef = useRef<any>(null);

    return (
        <div className={`relative rounded-3xl overflow-hidden bg-slate-950 border border-sky-500/30 shadow-[0_10px_50px_rgba(6,182,212,0.15)] select-none ${className}`}>
            <Suspense fallback={<JarvisHoloLoader />}>
                <Canvas camera={{ position: [0, 0.1, 3.2], fov: 42 }} className="w-full h-full cursor-grab active:cursor-grabbing" gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[5, 6, 4]} intensity={2.4} color="#ffffff" />
                    <directionalLight position={[-5, 3, -2]} intensity={2.0} color="#38BDF8" />
                    <WolfGLBModel onClick={onWolfClick} />
                    {interactive && <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.06} enableZoom={false} enablePan={false} autoRotate={autoRotate} />}
                </Canvas>
            </Suspense>
            {showControls && (
                <div className="absolute bottom-3 inset-x-4 flex justify-between z-10 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-sky-400/30 text-slate-200 text-xs font-mono pointer-events-auto">
                        <Move size={11} className="text-sky-400" /> 360° Drag
                    </div>
                    <button type="button" onClick={() => setAutoRotate(!autoRotate)} className="px-3 py-1.5 rounded-xl border bg-slate-950/80 border-white/10 text-slate-400 pointer-events-auto hover:text-white transition-all">
                        {autoRotate ? "Orbiting" : "Orbit"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Wolf3DCanvas;
