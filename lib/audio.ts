// Cybernetic JARVIS / FRIDAY Web Audio Synthesizer & Badass Cyberpunk Synth Engine

let audioCtx: AudioContext | null = null;
let cyberSynthGain: GainNode | null = null;
let cyberSynthOscs: (OscillatorNode | GainNode)[] = [];
let cyberArpInterval: NodeJS.Timeout | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

// 🔊 Futuristic Jarvis Activation Chime
export function playJarvisChime() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18); // D6

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
    } catch (e) {}
}

// 🔊 Cybernetic Telemetry Blip
export function playJarvisBlip() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.05);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    } catch (e) {}
}

// 🔊 Neural Data Stream Chirp
export function playJarvisTransmission() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        [0, 0.06, 0.12].forEach((offset, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(900 + idx * 300, now + offset);
            osc.frequency.exponentialRampToValueAtTime(1600 + idx * 200, now + offset + 0.04);

            gain.gain.setValueAtTime(0.05, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + offset);
            osc.stop(now + offset + 0.06);
        });
    } catch (e) {}
}

// 🎸 BADASS CYBERPUNK SYNTHESIZER ENGINE (Procedural Opening Music Loop)
export function startBadassCyberMusic(): () => void {
    try {
        const ctx = getAudioContext();
        if (!ctx) return () => {};

        stopBadassCyberMusic(); // Stop any active loop

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.2); // Smooth fade in
        masterGain.connect(ctx.destination);
        cyberSynthGain = masterGain;

        // 1. Deep Sub-Bass Synth Drone (55Hz / A1)
        const subOsc = ctx.createOscillator();
        const subFilter = ctx.createBiquadFilter();
        subOsc.type = "sawtooth";
        subOsc.frequency.setValueAtTime(55, ctx.currentTime); // Low A1

        subFilter.type = "lowpass";
        subFilter.frequency.setValueAtTime(140, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.4, ctx.currentTime);

        subOsc.connect(subFilter);
        subFilter.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start();
        cyberSynthOscs.push(subOsc);

        // 2. High-Tech Arpeggiated Cyber Scale (16-step rhythmic synth)
        const arpNotes = [110, 130.81, 164.81, 196, 220, 261.63, 329.63, 392]; // A2 Minor Arp
        let step = 0;

        cyberArpInterval = setInterval(() => {
            if (!ctx || ctx.state !== "running") return;

            const now = ctx.currentTime;
            const freq = arpNotes[step % arpNotes.length];
            step++;

            const arpOsc = ctx.createOscillator();
            const arpFilter = ctx.createBiquadFilter();
            const arpGain = ctx.createGain();

            arpOsc.type = step % 4 === 0 ? "square" : "sawtooth";
            arpOsc.frequency.setValueAtTime(freq, now);

            arpFilter.type = "bandpass";
            arpFilter.frequency.setValueAtTime(800 + Math.sin(now * 2) * 400, now);
            arpFilter.Q.setValueAtTime(3.0, now);

            arpGain.gain.setValueAtTime(0.15, now);
            arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            arpOsc.connect(arpFilter);
            arpFilter.connect(arpGain);
            arpGain.connect(masterGain);

            arpOsc.start(now);
            arpOsc.stop(now + 0.2);
        }, 130); // ~115 BPM rhythm

        return () => stopBadassCyberMusic();
    } catch (e) {
        return () => {};
    }
}

export function stopBadassCyberMusic() {
    if (cyberArpInterval) {
        clearInterval(cyberArpInterval);
        cyberArpInterval = null;
    }

    if (cyberSynthGain && audioCtx) {
        try {
            cyberSynthGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        } catch (e) {}
    }

    setTimeout(() => {
        cyberSynthOscs.forEach((osc) => {
            try {
                (osc as OscillatorNode).stop();
                (osc as OscillatorNode).disconnect();
            } catch (e) {}
        });
        cyberSynthOscs = [];
        cyberSynthGain = null;
    }, 450);
}

// 🗣️ Jarvis Robotic AI Voice Synthesizer
export function speakJarvis(text: string, onEnd?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        if (onEnd) onEnd();
        return;
    }

    try {
        window.speechSynthesis.cancel();

        const cleanText = text.replace(/[*#_`~>[\]]/g, "").replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);

        const voices = window.speechSynthesis.getVoices();
        const aiVoice = voices.find(
            (v) =>
                v.name.includes("Google") ||
                v.name.includes("Natural") ||
                v.name.includes("David") ||
                v.name.includes("Jarvis") ||
                v.name.includes("Daniel") ||
                v.name.includes("Samantha")
        ) || voices.find((v) => v.lang.startsWith("en"));

        if (aiVoice) {
            utterance.voice = aiVoice;
        }

        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.volume = 1.0;

        if (onEnd) {
            utterance.onend = onEnd;
            utterance.onerror = onEnd;
        }

        window.speechSynthesis.speak(utterance);
    } catch (e) {
        if (onEnd) onEnd();
    }
}

export function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}
