"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { Sparkles, RotateCw, Move, Shield, Radio, Zap } from "lucide-react";
import { isWebGLAvailable } from "@/lib/webgl-detect";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface WolfModelProps {
    onClick?: () => void;
}

function Wolf3DModel({ onClick }: WolfModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [scene, setScene] = useState<THREE.Group | null>(null);
    const pointerStart = useRef({ x: 0, y: 0, time: 0 });

    useEffect(() => {
        let cancelled = false;
        const loader = new GLTFLoader();
        // GLTFLoader r155+ auto-handles EXT_texture_webp internally
        loader.load(
            "/wolf.glb",
            (gltf) => {
                if (cancelled) return;
                gltf.scene.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        if (mesh.material) {
                            const mat = mesh.material as THREE.MeshStandardMaterial;
                            mat.roughness = Math.min(mat.roughness ?? 1, 0.65);
                            mat.metalness = Math.max(mat.metalness ?? 0, 0.2);
                            mat.envMapIntensity = 1.3;
                            mat.needsUpdate = true;
                        }
                    }
                });
                setScene(gltf.scene);
            },
            undefined,
            (err) => {
                console.warn("Wolf3D: could not load wolf.glb —", err);
            }
        );
        return () => { cancelled = true; };
    }, []);

    const handlePointerDown = (e: any) => {
        pointerStart.current = {
            x: e.clientX || e.touches?.[0]?.clientX || 0,
            y: e.clientY || e.touches?.[0]?.clientY || 0,
            time: Date.now(),
        };
    };

    const handlePointerUp = (e: any) => {
        const cx = e.clientX || e.changedTouches?.[0]?.clientX || 0;
        const cy = e.clientY || e.changedTouches?.[0]?.clientY || 0;
        const dist = Math.hypot(cx - pointerStart.current.x, cy - pointerStart.current.y);
        if (dist < 8 && Date.now() - pointerStart.current.time < 350) {
            if (groupRef.current) {
                gsap.fromTo(
                    groupRef.current.scale,
                    { x: 0.93, y: 0.93, z: 0.93 },
                    { x: 1, y: 1, z: 1, duration: 0.55, ease: "elastic.out(1.2, 0.4)" }
                );
            }
            if (onClick) onClick();
        }
    };

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.035;
        }
    });

    if (!scene) {
        // Glowing orb placeholder while model loads
        return (
            <mesh>
                <sphereGeometry args={[0.55, 32, 32]} />
                <meshStandardMaterial
                    color="#38BDF8"
                    emissive="#0ea5e9"
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.6}
                />
            </mesh>
        );
    }

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            rotation={[0.02, -0.45, 0]}
        >
            <Center position={[0, 0.02, 0]}>
                <primitive object={scene} scale={1.12} />
            </Center>
            <mesh position={[0, -0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.95, 32]} />
                <meshBasicMaterial color="#38BDF8" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.95, 32]} />
                <meshBasicMaterial color="#0c142e" transparent opacity={0.65} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

// Futuristic 2D Fallback Mascot — shown when WebGL is not available
function MascotFallback2D({ onMascotClick }: { onMascotClick?: () => void }) {
    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none gap-3"
            onClick={onMascotClick}
        >
            <div className="relative flex items-center justify-center">
                {/* Outer glow ring */}
                <div className="absolute w-36 h-36 rounded-full bg-sky-500/20 blur-2xl animate-pulse" />
                <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-sky-400/50 animate-spin [animation-duration:10s]" />
                <div className="absolute w-20 h-20 rounded-full border border-purple-500/40 animate-spin [animation-duration:6s] [animation-direction:reverse]" />

                {/* Wolf emoji + glow */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-sky-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                    <span className="text-4xl select-none" role="img" aria-label="MEVY Wolf Mascot">🐺</span>
                </div>
            </div>

            <div className="text-center space-y-1">
                <p className="font-orbitron font-bold text-xs text-sky-300 tracking-widest">MEVY · AI GUIDE</p>
                <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 justify-center">
                    <Zap size={9} className="text-amber-400" />
                    Tap to interact
                </p>
            </div>
        </div>
    );
}

// Loading spinner
function JarvisHoloLoader() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-3xl z-20 select-none">
            <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400/60 animate-spin [animation-duration:8s]" />
                <div className="absolute inset-2 rounded-full border border-purple-500/50 animate-spin [animation-duration:4s] [animation-direction:reverse]" />
                <div className="absolute inset-5 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-sky-400 border-l-transparent animate-spin" />
                <div className="w-6 h-6 rounded-full bg-sky-400/20 border border-sky-400 flex items-center justify-center">
                    <Radio size={12} className="text-sky-300 animate-pulse" />
                </div>
            </div>
            <p className="mt-4 font-orbitron font-bold text-[10px] tracking-widest text-sky-400 animate-pulse">
                LOADING 3D WOLF...
            </p>
        </div>
    );
}

export interface Wolf3DCanvasProps {
    onWolfClick?: () => void;
    interactive?: boolean;
    className?: string;
    showControls?: boolean;
}

export function Wolf3DCanvas({
    onWolfClick,
    interactive = true,
    className = "w-full h-full min-h-[320px] sm:min-h-[420px]",
    showControls = true,
}: Wolf3DCanvasProps) {
    const [autoRotate, setAutoRotate] = useState(false);
    const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        setWebGLSupported(isWebGLAvailable());
    }, []);

    const handleResetOrientation = () => {
        if (controlsRef.current) controlsRef.current.reset();
    };

    // Still detecting
    if (webGLSupported === null) {
        return (
            <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950/90 via-[#0a0d1e]/95 to-slate-950 border border-sky-500/30 ${className}`}>
                <JarvisHoloLoader />
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950/90 via-[#0a0d1e]/95 to-slate-950 border border-sky-500/30 shadow-[0_10px_50px_rgba(6,182,212,0.15)] select-none ${className}`}
        >
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,rgba(168,85,247,0.08)_45%,transparent_75%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-80" />

            {/* HUD Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-sky-400/70 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-sky-400/70 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-500/70 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-500/70 pointer-events-none" />

            {/* Top Telemetry */}
            <div className="absolute top-3 inset-x-3 sm:inset-x-4 flex items-center justify-between z-10 pointer-events-none">
                <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-full border border-sky-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-orbitron font-bold text-[9px] text-sky-200 tracking-wider">
                        {webGLSupported ? "3D WOLF · LIVE CANVAS" : "MEVY · 2D MODE"}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded-md border border-purple-500/30">
                    <Shield size={9} className="text-purple-400" />
                    <span>{webGLSupported ? "WEBGL ACTIVE" : "CANVAS MODE"}</span>
                </div>
            </div>

            {/* ── WebGL not available: show 2D mascot ── */}
            {!webGLSupported ? (
                <MascotFallback2D onMascotClick={onWolfClick} />
            ) : (
                /* ── WebGL available: render full 3D canvas ── */
                <ErrorBoundary
                    fallback={
                        <div className="w-full h-full flex items-center justify-center p-8">
                            <MascotFallback2D onMascotClick={onWolfClick} />
                        </div>
                    }
                >
                    <Suspense fallback={<JarvisHoloLoader />}>
                        <Canvas
                            camera={{ position: [0, 0.05, 3.4], fov: 42 }}
                            className="w-full h-full cursor-grab active:cursor-grabbing"
                            gl={{
                                antialias: true,
                                alpha: true,
                                powerPreference: "high-performance",
                                failIfMajorPerformanceCaveat: false,
                            }}
                            onCreated={({ gl }) => {
                                gl.toneMapping = THREE.ACESFilmicToneMapping;
                                gl.toneMappingExposure = 1.2;
                            }}
                        >
                            <ambientLight intensity={1.1} />
                            <directionalLight position={[5, 6, 4]} intensity={2.2} color="#ffffff" castShadow />
                            <directionalLight position={[-5, 3, -2]} intensity={1.8} color="#38BDF8" />
                            <pointLight position={[0, -2, 2]} intensity={1.4} color="#A855F7" />
                            <pointLight position={[0, 4, 0]} intensity={1.2} color="#00D4FF" />

                            <Wolf3DModel onClick={onWolfClick} />

                            {interactive && (
                                <OrbitControls
                                    ref={controlsRef}
                                    enableDamping
                                    dampingFactor={0.06}
                                    rotateSpeed={0.9}
                                    enableZoom={false}
                                    enablePan={false}
                                    minPolarAngle={Math.PI / 3.6}
                                    maxPolarAngle={Math.PI / 1.7}
                                    autoRotate={autoRotate}
                                    autoRotateSpeed={2.2}
                                />
                            )}
                        </Canvas>
                    </Suspense>
                </ErrorBoundary>
            )}

            {/* Bottom Controls */}
            {showControls && webGLSupported && (
                <div className="absolute bottom-2.5 sm:bottom-3 inset-x-3 sm:inset-x-4 flex items-center justify-between z-10 pointer-events-auto">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-sky-400/30 text-slate-200 text-[10px] font-mono">
                        <Move size={11} className="text-sky-400 animate-pulse" />
                        <span>360° Drag</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            type="button"
                            onClick={handleResetOrientation}
                            className="px-2 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-white text-[10px] font-mono transition-all"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={() => setAutoRotate(!autoRotate)}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-xl border text-[10px] font-mono transition-all ${
                                autoRotate
                                    ? "bg-sky-500/20 border-sky-400 text-sky-300"
                                    : "bg-slate-950/80 border-white/10 text-slate-400 hover:text-white"
                            }`}
                        >
                            <RotateCw size={11} className={autoRotate ? "animate-spin" : ""} />
                            <span>{autoRotate ? "Orbiting" : "Orbit"}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Wolf3DCanvas;
