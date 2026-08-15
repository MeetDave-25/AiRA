"use client";

import React, { useRef, useState, useEffect, Suspense, Component, ErrorInfo, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { RotateCw, Move, Shield, Radio, Sparkles } from "lucide-react";
import Image from "next/image";

// Preload the wolf model for immediate caching
if (typeof window !== "undefined") {
    useGLTF.preload("/wolf.glb");
}

function checkWebGLSupport(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!gl;
    } catch {
        return false;
    }
}

// ══════════════════════════════════════════════════════════════════════
// WEBGL ERROR BOUNDARY — Catches "Error creating WebGL context" safely
// ══════════════════════════════════════════════════════════════════════
interface ErrorBoundaryProps {
    fallback: React.ReactNode;
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class WebGLCanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.warn("[Wolf3DCanvas] WebGL context initialization fallback activated:", error.message);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

interface WolfModelProps {
    onClick?: () => void;
}

function Wolf3DModel({ onClick }: WolfModelProps) {
    const gltf = useGLTF("/wolf.glb");
    const groupRef = useRef<THREE.Group>(null);
    const pointerStart = useRef({ x: 0, y: 0, time: 0 });

    const sceneClone = useMemo(() => {
        if (!gltf.scene) return null;
        const cloned = gltf.scene.clone(true);
        cloned.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                if (mesh.material) {
                    const mat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    mat.roughness = Math.min(mat.roughness ?? 0.5, 0.65);
                    mat.metalness = Math.max(mat.metalness ?? 0.2, 0.25);
                    mat.envMapIntensity = 1.4;
                    mesh.material = mat;
                }
            }
        });
        return cloned;
    }, [gltf.scene]);

    const handlePointerDown = (e: any) => {
        pointerStart.current = {
            x: e.clientX || e.touches?.[0]?.clientX || 0,
            y: e.clientY || e.touches?.[0]?.clientY || 0,
            time: Date.now(),
        };
    };

    const handlePointerUp = (e: any) => {
        const clientX = e.clientX || e.changedTouches?.[0]?.clientX || 0;
        const clientY = e.clientY || e.changedTouches?.[0]?.clientY || 0;
        const dist = Math.hypot(clientX - pointerStart.current.x, clientY - pointerStart.current.y);
        const timeDiff = Date.now() - pointerStart.current.time;

        if (dist < 8 && timeDiff < 350) {
            if (groupRef.current) {
                gsap.fromTo(
                    groupRef.current.scale,
                    { x: 0.93, y: 0.93, z: 0.93 },
                    {
                        x: 1,
                        y: 1,
                        z: 1,
                        duration: 0.55,
                        ease: "elastic.out(1.2, 0.4)",
                    }
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

    if (!sceneClone) return null;

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            rotation={[0.02, -0.45, 0]}
        >
            <Center position={[0, 0.02, 0]}>
                <primitive object={sceneClone} scale={1.15} />
            </Center>

            {/* Glowing Holographic Base Platform */}
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

// Futuristic Holographic Loading Spinner
function JarvisHoloLoader() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-3xl z-20 select-none">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400/60 animate-spin [animation-duration:8s]" />
                <div className="absolute inset-2 rounded-full border border-purple-500/50 animate-spin [animation-duration:4s] [animation-direction:reverse]" />
                <div className="absolute inset-5 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-sky-400 border-l-transparent animate-spin" />
                <div className="w-7 h-7 rounded-full bg-sky-400/20 backdrop-blur-sm border border-sky-400 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.8)]">
                    <Radio size={14} className="text-sky-300 animate-pulse" />
                </div>
            </div>

            <div className="mt-4 text-center">
                <p className="font-orbitron font-bold text-xs tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-purple-400 animate-pulse">
                    CALIBRATING 3D NEURAL WOLF
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>JARVIS PROTOCOL · LOADING GLTF</span>
                </div>
            </div>
        </div>
    );
}

function HolographicMascotFallback({ onClick }: { onClick?: () => void }) {
    return (
        <div onClick={onClick} className="w-full h-full flex flex-col items-center justify-center relative select-none cursor-pointer">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400/40 animate-spin [animation-duration:12s]" />
                <div className="absolute inset-3 rounded-full border border-purple-500/30 animate-spin [animation-duration:8s] [animation-direction:reverse]" />
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-sky-400/60 shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                    <Image
                        src="/mascot-mevy.jpg"
                        alt="AiRA 3D Mascot Mevy"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        priority
                    />
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-400/40">
                <Sparkles size={11} className="text-amber-400 animate-spin [animation-duration:6s]" />
                <span className="font-orbitron text-[10px] text-sky-200 font-bold tracking-wider">MEVY · AI GUIDE</span>
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

export function Wolf3DCanvas({
    onWolfClick,
    interactive = true,
    className = "w-full h-full min-h-[320px] sm:min-h-[420px]",
    showControls = true,
}: Wolf3DCanvasProps) {
    const [autoRotate, setAutoRotate] = useState(false);
    const [webGLSupported, setWebGLSupported] = useState(true);
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        setWebGLSupported(checkWebGLSupport());
    }, []);

    const handleResetOrientation = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    return (
        <div
            className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950/90 via-[#0a0d1e]/95 to-slate-950 border border-sky-500/30 shadow-[0_10px_50px_rgba(6,182,212,0.15)] select-none ${className}`}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,rgba(168,85,247,0.08)_45%,transparent_75%)] pointer-events-none" />
            <div className="absolute -top-16 inset-x-0 h-32 bg-sky-400/10 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-80" />
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-sky-400/70 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-sky-400/70 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-500/70 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-500/70 pointer-events-none" />

            <div className="absolute top-3 inset-x-3 sm:inset-x-4 flex items-center justify-between z-10 pointer-events-none">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-full border border-sky-400/30">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-orbitron font-bold text-[9px] sm:text-[10px] text-sky-200 tracking-wider">
                        3D WOLF · LIVE CANVAS
                    </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-mono text-purple-300 bg-purple-950/60 px-1.5 sm:px-2 py-0.5 rounded-md border border-purple-500/30">
                    <Shield size={9} className="text-purple-400" />
                    <span>SILKY INERTIA</span>
                </div>
            </div>

            {webGLSupported ? (
                <WebGLCanvasErrorBoundary fallback={<HolographicMascotFallback onClick={onWolfClick} />}>
                    <Suspense fallback={<JarvisHoloLoader />}>
                        <Canvas
                            camera={{ position: [0, 0.05, 3.4], fov: 42 }}
                            className="w-full h-full cursor-grab active:cursor-grabbing"
                            gl={{
                                antialias: true,
                                alpha: true,
                                powerPreference: "default",
                                failIfMajorPerformanceCaveat: false,
                            }}
                            onCreated={({ gl }) => {
                                gl.toneMapping = THREE.ACESFilmicToneMapping;
                                gl.toneMappingExposure = 1.2;
                                gl.domElement.addEventListener("webglcontextlost", (e) => {
                                    e.preventDefault();
                                    setWebGLSupported(false);
                                });
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
                                    enableDamping={true}
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
                </WebGLCanvasErrorBoundary>
            ) : (
                <HolographicMascotFallback onClick={onWolfClick} />
            )}

            {showControls && (
                <div className="absolute bottom-2.5 sm:bottom-3 inset-x-3 sm:inset-x-4 flex items-center justify-between z-10 pointer-events-auto">
                    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-sky-400/30 text-slate-200 text-[10px] sm:text-xs font-mono">
                        <Move size={11} className="text-sky-400 animate-pulse" />
                        <span className="text-[10px] sm:text-[11px]">360° Drag</span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            type="button"
                            onClick={handleResetOrientation}
                            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-white text-[10px] sm:text-xs font-mono transition-all"
                            title="Reset 3D Orientation"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={() => setAutoRotate(!autoRotate)}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border backdrop-blur-md text-[10px] sm:text-xs font-mono transition-all ${
                                autoRotate
                                    ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                                    : "bg-slate-950/80 border-white/10 text-slate-400 hover:text-white hover:bg-slate-900"
                            }`}
                            title="Toggle Auto 360 Orbit"
                        >
                            <RotateCw size={11} className={autoRotate ? "animate-spin" : ""} />
                            <span className="text-[10px] sm:text-[11px]">{autoRotate ? "Orbiting" : "Orbit"}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Wolf3DCanvas;
