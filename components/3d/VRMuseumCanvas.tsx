"use client";

import React, { useRef, useState, useEffect, Suspense, Component, ErrorInfo, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Float, Text, Center } from "@react-three/drei";
import * as THREE from "three";

// Preload the wolf model for immediate availability
if (typeof window !== "undefined") {
    useGLTF.preload("/wolf.glb");
}

// ══════════════════════════════════════════════════════════════════════
// WEBGL ERROR BOUNDARY — Catches any WebGL context exhaustion safely
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
        console.warn("[VRMuseumCanvas] WebGL Error caught, falling back:", error.message);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// ══════════════════════════════════════════════════════════════════════
// 1. EXHIBIT: 3D WOLF MASCOT GUARDIAN
// ══════════════════════════════════════════════════════════════════════
function WolfExhibit({ position }: { position: [number, number, number] }) {
    const gltf = useGLTF("/wolf.glb");
    const meshRef = useRef<THREE.Group>(null);

    const sceneClone = useMemo(() => {
        if (!gltf.scene) return null;
        const cloned = gltf.scene.clone(true);
        cloned.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                if (mesh.material) {
                    const mat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    mat.roughness = 0.4;
                    mat.metalness = 0.6;
                    mat.emissive = new THREE.Color("#00D4FF");
                    mat.emissiveIntensity = 0.15;
                    mesh.material = mat;
                }
            }
        });
        return cloned;
    }, [gltf.scene]);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.4;
        }
    });

    return (
        <group position={position}>
            {/* Holographic Pedestal */}
            <mesh position={[0, -1.6, 0]}>
                <cylinderGeometry args={[2.2, 2.5, 0.4, 32]} />
                <meshStandardMaterial color="#0B1528" metalness={0.8} roughness={0.2} emissive="#00D4FF" emissiveIntensity={0.3} />
            </mesh>
            {/* Rotating Hologram Ring */}
            <mesh position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.1, 2.3, 32]} />
                <meshBasicMaterial color="#00D4FF" side={THREE.DoubleSide} transparent opacity={0.7} />
            </mesh>

            {/* Floating 3D Model */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
                <group ref={meshRef} scale={1.8} position={[0, -0.6, 0]}>
                    {sceneClone && <primitive object={sceneClone} />}
                </group>
            </Float>

            {/* Glowing Spotlight */}
            <pointLight position={[0, 2.5, 0]} color="#00D4FF" intensity={4} distance={8} />
        </group>
    );
}

// ══════════════════════════════════════════════════════════════════════
// 2. EXHIBIT: NEURAL INTELLIGENCE CORE
// ══════════════════════════════════════════════════════════════════════
function NeuralCoreExhibit({ position }: { position: [number, number, number] }) {
    const coreRef = useRef<THREE.Group>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (coreRef.current) {
            coreRef.current.rotation.y += delta * 0.5;
            coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
        }
        if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.8;
        if (ring2Ref.current) ring2Ref.current.rotation.x -= delta * 0.6;
    });

    return (
        <group position={position}>
            {/* Pedestal */}
            <mesh position={[0, -1.6, 0]}>
                <cylinderGeometry args={[2, 2.3, 0.4, 32]} />
                <meshStandardMaterial color="#0B1528" metalness={0.8} roughness={0.2} emissive="#8B5CF6" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.9, 2.1, 32]} />
                <meshBasicMaterial color="#8B5CF6" side={THREE.DoubleSide} transparent opacity={0.7} />
            </mesh>

            {/* Floating Neural Sphere & Gyro Rings */}
            <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
                <group ref={coreRef} position={[0, 0.2, 0]}>
                    {/* Glowing Icosahedron Core */}
                    <mesh>
                        <icosahedronGeometry args={[1, 1]} />
                        <meshStandardMaterial
                            color="#8B5CF6"
                            wireframe
                            emissive="#A78BFA"
                            emissiveIntensity={1.5}
                        />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[0.65, 16, 16]} />
                        <meshBasicMaterial color="#C084FC" />
                    </mesh>

                    {/* Gyro Rings */}
                    <mesh ref={ring1Ref}>
                        <torusGeometry args={[1.4, 0.04, 16, 64]} />
                        <meshBasicMaterial color="#00D4FF" />
                    </mesh>
                    <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
                        <torusGeometry args={[1.7, 0.03, 16, 64]} />
                        <meshBasicMaterial color="#F43F5E" />
                    </mesh>
                </group>
            </Float>

            <pointLight position={[0, 2.5, 0]} color="#8B5CF6" intensity={5} distance={8} />
        </group>
    );
}

// ══════════════════════════════════════════════════════════════════════
// 3. EXHIBIT: ROBOTICS & EMBEDDED DELTA
// ══════════════════════════════════════════════════════════════════════
function RoboticsExhibit({ position }: { position: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.4;
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.15 + 0.1;
        }
    });

    return (
        <group position={position}>
            {/* Pedestal */}
            <mesh position={[0, -1.6, 0]}>
                <cylinderGeometry args={[2, 2.3, 0.4, 32]} />
                <meshStandardMaterial color="#0B1528" metalness={0.8} roughness={0.2} emissive="#10B981" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.9, 2.1, 32]} />
                <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} transparent opacity={0.7} />
            </mesh>

            {/* Futuristic Delta & Orbiting Sensor Nodes */}
            <group ref={groupRef}>
                {/* Octahedron Robotic Chassis */}
                <mesh>
                    <octahedronGeometry args={[1.1, 0]} />
                    <meshStandardMaterial color="#059669" metalness={0.9} roughness={0.1} emissive="#34D399" emissiveIntensity={0.8} />
                </mesh>
                {/* Outer Wireframe Cage */}
                <mesh>
                    <boxGeometry args={[1.8, 1.8, 1.8]} />
                    <meshStandardMaterial color="#34D399" wireframe emissive="#10B981" emissiveIntensity={0.6} />
                </mesh>
            </group>

            <pointLight position={[0, 2.5, 0]} color="#10B981" intensity={4} distance={8} />
        </group>
    );
}

// ══════════════════════════════════════════════════════════════════════
// 4. EXHIBIT: HALL OF PRIDE & TROPHIES
// ══════════════════════════════════════════════════════════════════════
function TrophyExhibit({ position }: { position: [number, number, number] }) {
    const trophyRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (trophyRef.current) {
            trophyRef.current.rotation.y += delta * 0.6;
        }
    });

    return (
        <group position={position}>
            {/* Pedestal */}
            <mesh position={[0, -1.6, 0]}>
                <cylinderGeometry args={[2, 2.3, 0.4, 32]} />
                <meshStandardMaterial color="#0B1528" metalness={0.8} roughness={0.2} emissive="#F59E0B" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.9, 2.1, 32]} />
                <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} transparent opacity={0.7} />
            </mesh>

            {/* Glowing Golden Trophy */}
            <Float speed={2} floatIntensity={0.4}>
                <group ref={trophyRef} position={[0, 0.1, 0]}>
                    <mesh position={[0, 0.8, 0]}>
                        <cylinderGeometry args={[0.7, 0.3, 1, 16]} />
                        <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.1} emissive="#FBBF24" emissiveIntensity={0.6} />
                    </mesh>
                    <mesh position={[0, 0.1, 0]}>
                        <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
                        <meshStandardMaterial color="#D97706" metalness={0.9} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, -0.4, 0]}>
                        <boxGeometry args={[0.9, 0.4, 0.9]} />
                        <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.4} />
                    </mesh>
                </group>
            </Float>

            <pointLight position={[0, 2.5, 0]} color="#F59E0B" intensity={5} distance={8} />
        </group>
    );
}

// ══════════════════════════════════════════════════════════════════════
// 5. GRAND SINGULARITY PORTAL (FINAL STATION)
// ══════════════════════════════════════════════════════════════════════
function GrandSingularityPortal({ position, isEntering }: { position: [number, number, number]; isEntering: boolean }) {
    const ring1 = useRef<THREE.Mesh>(null);
    const ring2 = useRef<THREE.Mesh>(null);
    const ring3 = useRef<THREE.Mesh>(null);
    const coreRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        const mult = isEntering ? 5 : 1;
        if (ring1.current) ring1.current.rotation.z += delta * 0.8 * mult;
        if (ring2.current) ring2.current.rotation.z -= delta * 1.2 * mult;
        if (ring3.current) ring3.current.rotation.z += delta * 0.5 * mult;
        if (coreRef.current) {
            const pulse = isEntering ? 1.5 + Math.sin(state.clock.elapsedTime * 20) * 0.5 : 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
            coreRef.current.scale.set(pulse, pulse, 1);
        }
    });

    return (
        <group position={position}>
            {/* Event Horizon Dark Core */}
            <mesh ref={coreRef} position={[0, 1.5, 0]}>
                <circleGeometry args={[4.2, 64]} />
                <meshBasicMaterial color="#020817" side={THREE.DoubleSide} />
            </mesh>

            {/* Glowing Singularity Backlight */}
            <mesh position={[0, 1.5, -0.1]}>
                <circleGeometry args={[5.2, 64]} />
                <meshBasicMaterial color="#00D4FF" side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>

            {/* Rotating Cyber Plasma Rings */}
            <mesh ref={ring1} position={[0, 1.5, 0.1]}>
                <torusGeometry args={[4.2, 0.18, 16, 64]} />
                <meshStandardMaterial color="#00D4FF" emissive="#38BDF8" emissiveIntensity={3} />
            </mesh>
            <mesh ref={ring2} position={[0, 1.5, 0.2]}>
                <torusGeometry args={[4.8, 0.12, 16, 64]} />
                <meshStandardMaterial color="#8B5CF6" emissive="#A78BFA" emissiveIntensity={2.5} />
            </mesh>
            <mesh ref={ring3} position={[0, 1.5, 0.3]}>
                <torusGeometry args={[5.4, 0.08, 16, 64]} />
                <meshStandardMaterial color="#F43F5E" emissive="#FB7185" emissiveIntensity={2} />
            </mesh>

            {/* Archway Columns */}
            <mesh position={[-5.8, 1.5, 0]}>
                <boxGeometry args={[0.8, 9, 0.8]} />
                <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} emissive="#00D4FF" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[5.8, 1.5, 0]}>
                <boxGeometry args={[0.8, 9, 0.8]} />
                <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} emissive="#00D4FF" emissiveIntensity={0.2} />
            </mesh>

            <pointLight position={[0, 1.5, 2]} color="#00D4FF" intensity={isEntering ? 20 : 8} distance={25} />
        </group>
    );
}

// ══════════════════════════════════════════════════════════════════════
// 6. 3D CYBER CORRIDOR ARCHITECTURE & LIGHTING
// ══════════════════════════════════════════════════════════════════════
function CyberMuseumCorridor() {
    return (
        <group>
            {/* Reflective Dark Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -45]}>
                <planeGeometry args={[18, 120]} />
                <meshStandardMaterial
                    color="#040812"
                    roughness={0.15}
                    metalness={0.85}
                />
            </mesh>

            {/* Glowing Floor Edge Rails */}
            <mesh position={[-6.5, -1.95, -45]}>
                <boxGeometry args={[0.2, 0.1, 120]} />
                <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={1.5} />
            </mesh>
            <mesh position={[6.5, -1.95, -45]}>
                <boxGeometry args={[0.2, 0.1, 120]} />
                <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={1.5} />
            </mesh>

            {/* Dark Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7, -45]}>
                <planeGeometry args={[18, 120]} />
                <meshStandardMaterial color="#030712" roughness={0.8} />
            </mesh>

            {/* Periodic Archway Columns along Corridor */}
            {[-5, -18, -32, -46, -60, -74].map((z, idx) => (
                <group key={idx} position={[0, 0, z]}>
                    {/* Left Pillar */}
                    <mesh position={[-7.5, 2.5, 0]}>
                        <boxGeometry args={[0.6, 9, 0.6]} />
                        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} emissive="#00D4FF" emissiveIntensity={0.15} />
                    </mesh>
                    {/* Right Pillar */}
                    <mesh position={[7.5, 2.5, 0]}>
                        <boxGeometry args={[0.6, 9, 0.6]} />
                        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} emissive="#00D4FF" emissiveIntensity={0.15} />
                    </mesh>
                    {/* Top Crossbar */}
                    <mesh position={[0, 6.8, 0]}>
                        <boxGeometry args={[15.6, 0.4, 0.6]} />
                        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
                    </mesh>
                    {/* Pillar Light Strip */}
                    <mesh position={[-7.1, 2.5, 0]}>
                        <boxGeometry args={[0.08, 8.5, 0.08]} />
                        <meshBasicMaterial color="#38BDF8" />
                    </mesh>
                    <mesh position={[7.1, 2.5, 0]}>
                        <boxGeometry args={[0.08, 8.5, 0.08]} />
                        <meshBasicMaterial color="#38BDF8" />
                    </mesh>
                </group>
            ))}

            {/* Ambient & Directional Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[0, 10, -20]} intensity={1.5} color="#38BDF8" />
        </group>
    );
}

// ══════════════════════════════════════════════════════════════════════
// 7. CAMERA FLY-THROUGH CONTROLLER WITH VR LOOK & HYPERDRIVE WARP
// ══════════════════════════════════════════════════════════════════════
interface CameraControllerProps {
    isEntering: boolean;
    onReachPortal: () => void;
    onEnterComplete: () => void;
    onZoneChange: (zoneIndex: number) => void;
}

function CameraController({ isEntering, onReachPortal, onEnterComplete, onZoneChange }: CameraControllerProps) {
    const { camera } = useThree();
    const targetZ = useRef(8);
    const reachedPortal = useRef(false);
    const lookTarget = useRef(new THREE.Vector2(0, 0));
    const currentLook = useRef(new THREE.Vector2(0, 0));

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            lookTarget.current.set(x * 1.5, -y * 0.8);
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) {
                const x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
                const y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
                lookTarget.current.set(x * 1.5, -y * 0.8);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    useFrame((_, delta) => {
        // VR smooth look interpolation
        currentLook.current.lerp(lookTarget.current, delta * 4);

        if (isEntering) {
            // Hyperdrive warp acceleration into the portal
            targetZ.current -= delta * 50;
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ.current, delta * 12);
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, delta * 8);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.5, delta * 8);
            camera.lookAt(0, 1.5, camera.position.z - 20);

            if (camera.position.z <= -86) {
                onEnterComplete();
            }
            return;
        }

        // Standard automated museum walk
        if (targetZ.current > -70) {
            targetZ.current -= delta * 7.5; // Smooth walking speed
        } else if (!reachedPortal.current) {
            reachedPortal.current = true;
            onReachPortal();
        }

        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ.current, delta * 4);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, currentLook.current.x * 0.8, delta * 3);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.4 + currentLook.current.y * 0.4, delta * 3);

        // Look forward towards the upcoming hall section with gentle VR look offset
        camera.lookAt(
            currentLook.current.x * 3,
            0.5 + currentLook.current.y * 1.5,
            camera.position.z - 15
        );

        // Zone reporting based on position
        const currentZ = camera.position.z;
        if (currentZ > -18) onZoneChange(0);      // Mascot Pod
        else if (currentZ > -34) onZoneChange(1); // Neural Core
        else if (currentZ > -50) onZoneChange(2); // Robotics Delta
        else if (currentZ > -65) onZoneChange(3); // Trophy Hall
        else onZoneChange(4);                     // Grand Portal
    });

    return null;
}

// ══════════════════════════════════════════════════════════════════════
// 8. MAIN EXPORT: VR MUSEUM CANVAS COMPONENT
// ══════════════════════════════════════════════════════════════════════
export interface VRMuseumCanvasProps {
    isEntering: boolean;
    onReachPortal: () => void;
    onEnterComplete: () => void;
    onZoneChange: (zoneIndex: number) => void;
}

export function VRMuseumCanvas({ isEntering, onReachPortal, onEnterComplete, onZoneChange }: VRMuseumCanvasProps) {
    return (
        <div className="w-full h-full relative select-none">
            <WebGLCanvasErrorBoundary
                fallback={
                    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white font-orbitron">
                        <p>3D VR Museum Engine Activated</p>
                    </div>
                }
            >
                <Canvas
                    camera={{ position: [0, 0.4, 8], fov: 65, near: 0.1, far: 150 }}
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        alpha: false,
                    }}
                    dpr={[1, 2]}
                >
                    <color attach="background" args={["#030712"]} />
                    <fog attach="fog" args={["#030712", 20, 95]} />

                    {/* Camera flight and VR look controller */}
                    <CameraController
                        isEntering={isEntering}
                        onReachPortal={onReachPortal}
                        onEnterComplete={onEnterComplete}
                        onZoneChange={onZoneChange}
                    />

                    {/* Corridor Environment */}
                    <CyberMuseumCorridor />

                    {/* 4 Exhibit Pods along the gallery */}
                    <Suspense fallback={null}>
                        <WolfExhibit position={[0, 0, -12]} />
                        <NeuralCoreExhibit position={[0, 0, -28]} />
                        <RoboticsExhibit position={[0, 0, -44]} />
                        <TrophyExhibit position={[0, 0, -60]} />
                        <GrandSingularityPortal position={[0, 0, -80]} isEntering={isEntering} />
                    </Suspense>
                </Canvas>
            </WebGLCanvasErrorBoundary>
        </div>
    );
}

export default VRMuseumCanvas;
