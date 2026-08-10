// Cybernetic JARVIS / FRIDAY Web Audio Synthesizer & Speech Engine

let audioCtx: AudioContext | null = null;

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
    } catch (e) {
        // Audio fallback
    }
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

// 🗣️ Jarvis / Friday Robotic AI Voice Synthesizer
export function speakJarvis(text: string, onEnd?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        if (onEnd) onEnd();
        return;
    }

    try {
        window.speechSynthesis.cancel(); // cancel any ongoing speech

        const cleanText = text.replace(/[*#_`~>[\]]/g, "").replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Find standard English AI voice if available
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
