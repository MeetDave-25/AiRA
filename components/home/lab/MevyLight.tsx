"use client";

// "Mevy, made of light" — the 3D wolf baked into 60,000 particles (scripts/build-mevy-particles.mjs).
// Scroll: dust gathers into Mevy → he morphs into the word "AiRA" → scatters away.
// Cursor/finger: particles flee like a force field and Mevy turns to follow. Tap: shockwave + reform.

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { MevySays } from "./ui";

const BRAND = [
    [255, 216, 77], // sun
    [108, 92, 231], // violet
    [168, 239, 201], // mint
    [255, 180, 138], // peach
    [157, 214, 255], // sky
];

const vertexShader = /* glsl */ `
    attribute vec3 aScatter;
    attribute vec3 aText;
    attribute vec3 aColor;
    attribute vec3 aBrand;
    attribute float aRand;

    uniform float uTime;
    uniform float uAssemble;
    uniform float uText;
    uniform float uDissolve;
    uniform float uBurst;
    uniform vec3  uMouse;
    uniform float uMouseOn;
    uniform float uField;
    uniform float uSize;
    uniform float uPixelRatio;

    varying vec3 vColor;
    varying float vAlpha;

    vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
    float ease(float x) { return 1.0 - pow(1.0 - x, 3.0); }

    void main() {
        // Each particle arrives at its own moment, so the wolf "fills in" instead of popping.
        float a = ease(clamp(uAssemble * 1.6 - aRand * 0.6, 0.0, 1.0));
        float t = ease(clamp(uText * 1.6 - aRand * 0.6, 0.0, 1.0));
        float d = ease(clamp(uDissolve * 1.6 - aRand * 0.6, 0.0, 1.0));

        // The dust cloud slowly swirls like a galaxy until it's pulled in.
        vec3 cloud = rotY(aScatter, uTime * (0.08 + aRand * 0.18));
        cloud.y += sin(uTime * 0.7 + aRand * 31.0) * 0.08;

        vec3 p = mix(cloud, position, a);
        p = mix(p, aText, t);
        p = mix(p, cloud * vec3(1.7, 1.5, 0.5), d);

        // Breathing shimmer.
        p += 0.006 * vec3(sin(uTime * 2.1 + aRand * 40.0), cos(uTime * 1.7 + aRand * 23.0), sin(uTime * 1.3 + aRand * 17.0));

        // Force field around the cursor.
        vec3 toP = p - uMouse;
        float dist = length(toP.xy);
        float push = uMouseOn * smoothstep(uField, 0.0, dist);
        p += normalize(toP + vec3(0.0, 0.0, 0.0001)) * push * (0.22 + aRand * 0.18);

        // Tap shockwave: blow outward from the centre, then the springs pull everything back.
        vec3 outward = normalize(p * vec3(1.0, 0.6, 1.0) + vec3(0.0001));
        p += outward * uBurst * (0.5 + aRand * 1.4);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(uSize * uPixelRatio * (0.55 + aRand * 0.9) / -mv.z, 9.0 * uPixelRatio);

        // Brand colours while it's dust or text, Mevy's real colours when he's whole.
        float real = a * (1.0 - t) * (1.0 - d);
        vColor = mix(aBrand, aColor, real);
        vColor += push * 0.35;
        vAlpha = mix(0.75, 1.0, real);
    }
`;

const fragmentShader = /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        if (r > 0.5) discard;
        float soft = smoothstep(0.5, 0.18, r);
        gl_FragColor = vec4(vColor, vAlpha * soft);
    }
`;

/** Sample N points from the filled pixels of the word "AiRA". */
async function textPoints(n: number, rand: () => number, width: number) {
    await document.fonts?.ready;
    const cv = document.createElement("canvas");
    cv.width = 1200;
    cv.height = 400;
    const ctx = cv.getContext("2d");
    if (!ctx) return new Float32Array(n * 3);
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-brico").trim() || "sans-serif";
    ctx.fillStyle = "#fff";
    ctx.font = `800 300px ${family}, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AiRA", 600, 215);
    const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
    const filled: number[] = [];
    for (let y = 0; y < cv.height; y += 2) for (let x = 0; x < cv.width; x += 2) if (data[(y * cv.width + x) * 4 + 3] > 128) filled.push(x, y);
    const out = new Float32Array(n * 3);
    const count = filled.length / 2;
    for (let i = 0; i < n; i++) {
        const k = Math.floor(rand() * count) * 2;
        out[i * 3] = ((filled[k] + rand() * 2) / cv.width - 0.5) * width;
        out[i * 3 + 1] = -((filled[k + 1] + rand() * 2) / cv.height - 0.5) * (width / 3);
        out[i * 3 + 2] = (rand() - 0.5) * 0.12;
    }
    return out;
}

function webglAvailable() {
    try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
        return false;
    }
}

const STAGES = [
    { at: 0.0, kicker: "01 · Something's gathering", title: "Look closer.", body: "Sixty thousand specks of light are looking for each other." },
    { at: 0.24, kicker: "02 · Assembled", title: "Meet Mevy.", body: "Our mascot, rebuilt from 60,000 particles. Move your cursor near him — he's a little shy. Tap to shake him apart." },
    { at: 0.56, kicker: "03 · Shape-shifter", title: "Mevy is the lab.", body: "Every particle is a student, an idea, a late-night build. Together they make AiRA." },
    { at: 0.86, kicker: "04 · Scatter", title: "Now go build.", body: "The pieces go back out into the world — that's where you come in." },
];

export default function MevyLight() {
    const sectionRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef(0);
    const burstRef = useRef(0);
    const [stage, setStage] = useState(0);
    const [fallback, setFallback] = useState(false);

    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        progressRef.current = v;
        let s = 0;
        STAGES.forEach((st, i) => { if (v >= st.at) s = i; });
        setStage(s);
    });

    useEffect(() => {
        const host = stageRef.current;
        if (!host) return;
        if (!webglAvailable()) { setFallback(true); return; }

        let disposed = false;
        let cleanup = () => {};

        (async () => {
            const [THREE, buf] = await Promise.all([
                import("three"),
                fetch("/mevy-particles.bin").then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("particles")))),
            ]).catch(() => [null, null] as const);
            if (disposed) return;
            if (!THREE || !buf) { setFallback(true); return; }

            const isMobile = window.innerWidth < 768;
            const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
            const total = new DataView(buf).getUint32(0, true);
            // Points were sampled in random order, so the first N are an even subset.
            const N = isMobile ? Math.min(total, 26000) : total;

            const pos = new Int16Array(buf, 4, total * 3);
            const col = new Uint8Array(buf, 4 + total * 6, total * 3);

            let seed = 7;
            const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

            const position = new Float32Array(N * 3);
            const color = new Float32Array(N * 3);
            const scatter = new Float32Array(N * 3);
            const brand = new Float32Array(N * 3);
            const rnd = new Float32Array(N);
            for (let i = 0; i < N; i++) {
                for (let k = 0; k < 3; k++) {
                    position[i * 3 + k] = (pos[i * 3 + k] / 32767) * 1.6 * 1.05; // model is 2 tall → ~2.1 world units
                    color[i * 3 + k] = col[i * 3 + k] / 255;
                }
                // Galaxy-like disc of dust.
                const ang = rand() * Math.PI * 2;
                const rad = 1.4 + Math.pow(rand(), 0.7) * 3.2;
                scatter[i * 3] = Math.cos(ang) * rad;
                scatter[i * 3 + 1] = (rand() - 0.5) * 1.6 * (1.2 - rad / 5);
                scatter[i * 3 + 2] = Math.sin(ang) * rad - 0.5;
                const b = BRAND[i % BRAND.length];
                brand[i * 3] = b[0] / 255; brand[i * 3 + 1] = b[1] / 255; brand[i * 3 + 2] = b[2] / 255;
                rnd[i] = rand();
            }
            // Fit the word to the screen: visible width at the camera distance, with a margin.
            const aspect0 = host.clientWidth / Math.max(1, host.clientHeight);
            const visibleW = 2 * (aspect0 < 0.8 ? 6.4 : 5.6) * Math.tan((38 / 2) * (Math.PI / 180)) * aspect0;
            const text = await textPoints(N, rand, Math.min(3.9, visibleW * 0.84));
            if (disposed) return;

            const geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
            geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
            geo.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
            geo.setAttribute("aText", new THREE.BufferAttribute(text, 3));
            geo.setAttribute("aBrand", new THREE.BufferAttribute(brand, 3));
            geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));

            const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);
            const uniforms = {
                uTime: { value: 0 },
                uAssemble: { value: reduced ? 1 : 0 },
                uText: { value: 0 },
                uDissolve: { value: 0 },
                uBurst: { value: 0 },
                uMouse: { value: new THREE.Vector3(99, 99, 0) },
                uMouseOn: { value: 0 },
                uField: { value: isMobile ? 0.22 : 0.38 },
                uSize: { value: isMobile ? 26 : 22 },
                uPixelRatio: { value: dpr },
            };
            const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false });
            const points = new THREE.Points(geo, mat);
            points.frustumCulled = false;

            const scene = new THREE.Scene();
            const group = new THREE.Group();
            group.add(points);
            scene.add(group);

            const camera = new THREE.PerspectiveCamera(38, host.clientWidth / host.clientHeight, 0.1, 50);
            const fitCamera = () => {
                const aspect = host.clientWidth / Math.max(1, host.clientHeight);
                camera.aspect = aspect;
                // Keep the whole wolf (and the wide "AiRA") in frame on tall phone screens.
                camera.position.set(0, 0.1, aspect < 0.8 ? 6.4 : 5.6);
                camera.updateProjectionMatrix();
            };
            fitCamera();

            const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
            renderer.setPixelRatio(dpr);
            renderer.setSize(host.clientWidth, host.clientHeight);
            renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
            host.appendChild(renderer.domElement);

            // Pointer → a point on the z=0 plane in the particles' local space.
            const ndc = new THREE.Vector2();
            const ray = new THREE.Raycaster();
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
            const hit = new THREE.Vector3();
            let pointerOn = false;
            let lookX = 0;
            const onMove = (e: PointerEvent) => {
                const r = host.getBoundingClientRect();
                ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
                lookX = ndc.x;
                pointerOn = true;
            };
            const onLeave = () => { pointerOn = false; };
            const onTap = (e: PointerEvent) => { onMove(e); burstRef.current = 1; };
            // Fingers do not hover: drop the force field as soon as the touch ends.
            const onUp = (e: PointerEvent) => { if (e.pointerType !== "mouse") pointerOn = false; };
            host.addEventListener("pointermove", onMove);
            host.addEventListener("pointerdown", onTap);
            host.addEventListener("pointerleave", onLeave);
            host.addEventListener("pointerup", onUp);
            host.addEventListener("pointercancel", onLeave);

            let visible = true;
            const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
            io.observe(host);

            const onResize = () => {
                fitCamera();
                renderer.setSize(host.clientWidth, host.clientHeight);
            };
            window.addEventListener("resize", onResize);

            const smooth = { a: uniforms.uAssemble.value, t: 0, d: 0, mouse: 0, rotY: 0 };
            let last = performance.now();
            let raf = 0;
            const loop = (now: number) => {
                raf = requestAnimationFrame(loop);
                if (!visible) { last = now; return; }
                const dt = Math.min(0.05, (now - last) / 1000);
                last = now;
                uniforms.uTime.value += dt;

                // Scroll timeline → targets, eased so fast scrolling still looks fluid.
                const p = reduced ? 0.4 : progressRef.current;
                const ta = Math.min(1, Math.max(0, (p - 0.04) / 0.24));
                const tt = Math.min(1, Math.max(0, (p - 0.54) / 0.2));
                const td = Math.min(1, Math.max(0, (p - 0.86) / 0.14));
                const k = 1 - Math.pow(0.0025, dt);
                smooth.a += (ta - smooth.a) * k;
                smooth.t += (tt - smooth.t) * k;
                smooth.d += (td - smooth.d) * k;
                uniforms.uAssemble.value = smooth.a;
                uniforms.uText.value = smooth.t;
                uniforms.uDissolve.value = smooth.d;

                // Shockwave decays like a spring settling.
                burstRef.current *= Math.pow(0.04, dt);
                uniforms.uBurst.value = burstRef.current;

                // Mevy turns toward the cursor (and faces front for the word).
                const wolfness = smooth.a * (1 - smooth.t);
                const idle = Math.sin(uniforms.uTime.value * 0.4) * 0.25;
                const targetRot = wolfness * (pointerOn ? lookX * 0.7 : idle) + (1 - smooth.a) * uniforms.uTime.value * 0.05;
                smooth.rotY += (targetRot - smooth.rotY) * (1 - Math.pow(0.02, dt));
                group.rotation.y = smooth.rotY;

                smooth.mouse += ((pointerOn ? 1 : 0) - smooth.mouse) * (1 - Math.pow(0.01, dt));
                uniforms.uMouseOn.value = smooth.mouse;
                if (pointerOn) {
                    ray.setFromCamera(ndc, camera);
                    if (ray.ray.intersectPlane(plane, hit)) {
                        points.updateMatrixWorld();
                        uniforms.uMouse.value.copy(points.worldToLocal(hit.clone()));
                    }
                }

                renderer.render(scene, camera);
            };
            raf = requestAnimationFrame(loop);

            cleanup = () => {
                cancelAnimationFrame(raf);
                io.disconnect();
                window.removeEventListener("resize", onResize);
                host.removeEventListener("pointermove", onMove);
                host.removeEventListener("pointerdown", onTap);
                host.removeEventListener("pointerleave", onLeave);
                host.removeEventListener("pointerup", onUp);
                host.removeEventListener("pointercancel", onLeave);
                geo.dispose();
                mat.dispose();
                renderer.dispose();
                renderer.domElement.remove();
            };
        })();

        return () => {
            disposed = true;
            cleanup();
        };
    }, []);

    const s = STAGES[stage];

    return (
        <section ref={sectionRef} aria-label="Meet Mevy, made of light" className="relative h-[420vh] bg-nb-ink text-nb-paper">
            <div className="sticky top-0 h-[100svh] overflow-hidden [background-image:linear-gradient(rgba(243,239,228,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(243,239,228,0.05)_1px,transparent_1px)] [background-size:32px_32px]">
                {/* Glow behind the particles */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_55%,rgba(108,92,231,0.28),transparent_55%)]" />

                {/* WebGL stage */}
                <div ref={stageRef} className="absolute inset-0 touch-pan-y cursor-crosshair" aria-hidden="true" />

                {fallback && (
                    <img src="/mevy-cutout.webp" alt="Mevy, the AiRA Lab mascot" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[60vh] w-auto drop-shadow-[6px_8px_0_rgba(0,0,0,0.9)]" />
                )}

                {/* Caption card */}
                <div className="absolute left-0 right-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 px-4 sm:px-8 lg:px-12 pb-6 sm:pb-0 pointer-events-none">
                    <div className="max-w-[1360px] mx-auto">
                        <motion.div
                            key={stage}
                            initial={{ opacity: 0, y: 24, rotate: -3 }}
                            animate={{ opacity: 1, y: 0, rotate: -1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className="max-w-sm rounded-[22px] border-2 border-nb-ink bg-nb-paper text-nb-ink p-5 sm:p-6 shadow-[6px_6px_0_0_#6C5CE7]"
                        >
                            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-nb-violet">{s.kicker}</p>
                            <h2 className="mt-2 font-brico font-extrabold tracking-[-0.04em] leading-[0.95] text-[clamp(2rem,4.5vw,3.4rem)]">{s.title}</h2>
                            <p className="mt-3 text-[15px] leading-relaxed text-nb-ink/75">{s.body}</p>
                        </motion.div>
                    </div>
                </div>

                {/* Progress rail */}
                <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none" aria-hidden="true">
                    {STAGES.map((st, i) => (
                        <span key={st.title} className={`w-2.5 rounded-full border-2 border-nb-paper/60 transition-all duration-300 ${i === stage ? "h-8 bg-nb-sun" : "h-2.5 bg-transparent"}`} />
                    ))}
                </div>

                <div className="absolute top-6 left-0 right-0 px-4 sm:px-8 lg:px-12 pointer-events-none">
                    <div className="max-w-[1360px] mx-auto flex justify-between items-start gap-4">
                        <MevySays className="hidden sm:inline-flex">Psst — this one is me. Try poking me.</MevySays>
                        <p className="ml-auto font-mono text-[10px] sm:text-xs uppercase tracking-[0.16em] text-nb-paper/50">Made of light · 60,000 particles</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
