"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, X, Trash2, Minus, Maximize2, Move, RotateCcw, 
    Sparkles, Volume2, VolumeX, Mic, MicOff, Radio, 
    Shield, Cpu, Zap, Activity, Terminal
} from "lucide-react";
import toast from "react-hot-toast";
import { playJarvisChime, playJarvisBlip, playJarvisTransmission, speakJarvis, stopSpeaking } from "@/lib/audio";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

// 🤖 Official Holographic Arc Reactor Avatar for Jarvis / 3D Wolf
export function JarvisAvatar({ size = 38, isSpeaking = false }: { size?: number; isSpeaking?: boolean }) {
    return (
        <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className="relative shrink-0 rounded-2xl overflow-hidden border border-sky-400/70 shadow-[0_0_20px_rgba(56,189,248,0.5)] select-none bg-[#070b1a] flex items-center justify-center"
        >
            {/* Spinning Arc Reactor Rings */}
            <div className="absolute inset-0 rounded-2xl border border-dashed border-sky-400/40 animate-spin [animation-duration:10s] pointer-events-none" />
            <div className="absolute inset-1 rounded-xl border border-purple-500/40 animate-spin [animation-duration:5s] [animation-direction:reverse] pointer-events-none" />

            <video
                src="/aira-mascot-loop.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/mascot.png"
                className="w-full h-full object-cover object-center relative z-10"
                onEnded={(e) => {
                    e.currentTarget.currentTime = 0;
                    e.currentTarget.play().catch(() => {});
                }}
            />

            {/* Speaking Audio Glow Pulse */}
            {isSpeaking && (
                <div className="absolute inset-0 bg-sky-400/30 blur-sm animate-pulse z-20 pointer-events-none" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/60 via-transparent to-transparent pointer-events-none z-20" />
        </div>
    );
}

export function AiraAiChatbot({ className = "fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40" }: { className?: string }) {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [resetKey, setResetKey] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Yo what's good! I'm Mevy, your 24/7 AI companion for AiRA Lab 🐺⚡\n\nAsk me anything about our autonomous robotics, 5 tech wings, upcoming hackathons, or how to join the squad! Chat with me in English, Hindi/Hinglish, or Gujarati—let's build! 🚀🔥"
        }
    ]);
    const [loading, setLoading] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Global event listener to open Jarvis chat from anywhere (e.g. 3D Wolf click)
    useEffect(() => {
        const handleOpenChat = () => {
            setIsOpen(true);
            setIsMinimized(false);
            if (soundEnabled) playJarvisChime();
        };
        window.addEventListener("open-aira-chat", handleOpenChat);
        return () => window.removeEventListener("open-aira-chat", handleOpenChat);
    }, [soundEnabled]);

    // Initialize Web Speech Recognition if supported
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = "en-US";

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInputMessage(transcript);
                    setIsRecordingVoice(false);
                    if (soundEnabled) playJarvisBlip();
                    handleSendMessage(transcript);
                };

                recognition.onerror = () => {
                    setIsRecordingVoice(false);
                    toast.error("Voice input error or permission denied");
                };

                recognition.onend = () => {
                    setIsRecordingVoice(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, [soundEnabled]);

    const toggleVoiceRecording = () => {
        if (!recognitionRef.current) {
            toast.error("Speech recognition is not supported in this browser");
            return;
        }

        if (isRecordingVoice) {
            recognitionRef.current.stop();
            setIsRecordingVoice(false);
        } else {
            try {
                if (soundEnabled) playJarvisBlip();
                recognitionRef.current.start();
                setIsRecordingVoice(true);
                toast.success("Listening... Speak your command 🎙️");
            } catch (e) {
                setIsRecordingVoice(false);
            }
        }
    };

    // Scroll ONLY inside the chat container
    const scrollToChatBottom = () => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTo({
                top: chatScrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            const timer = setTimeout(scrollToChatBottom, 60);
            return () => clearTimeout(timer);
        }
    }, [messages, isOpen, isMinimized]);

    const quickProtocols = [
        { label: "⚡ What is AiRA Lab?", query: "Tell me what AiRA Lab is all about and what makes it special!" },
        { label: "🧠 5 Tech Wings", query: "What are the 5 Tech Wings where students build projects?" },
        { label: "🐺 Meet Mevy", query: "Who is Mevy the 3D Cyber Wolf mascot?" },
        { label: "📅 Events & Hackathons", query: "What upcoming hackathons and events are scheduled?" },
        { label: "🏆 Lab Wins & Awards", query: "What are the biggest hackathon achievements of AiRA Lab?" },
        { label: "🚀 Join the Squad", query: "How do I apply or join AiRA Lab?" }
    ];

    const handleSendMessage = async (textToSend?: string) => {
        const query = (textToSend || inputMessage).trim();
        if (!query || loading) return;

        if (soundEnabled) playJarvisTransmission();
        stopSpeaking();
        setIsSpeaking(false);

        const newMessages: Message[] = [...messages, { role: "user", content: query }];
        setMessages(newMessages);
        setInputMessage("");
        setLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.slice(-8),
                    userMessage: query,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Neural link failure");
            }

            const data = await res.json();
            const reply = data.reply || "Directive acknowledged. System online.";

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: reply }
            ]);

            if (soundEnabled) playJarvisBlip();

            // Speak response if voice output is toggled on
            if (voiceOutputEnabled) {
                setIsSpeaking(true);
                speakJarvis(reply, () => setIsSpeaking(false));
            }
        } catch (error: any) {
            console.error("Jarvis Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠️ Neural link momentarily disrupted by cosmic interference. Re-attempting query handshake..." }
            ]);
            toast.error(error?.message || "Jarvis connection error");
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        stopSpeaking();
        setIsSpeaking(false);
        setMessages([
            {
                role: "assistant",
                content: "Memory registers purged. Ready for new operational directives. ⚡"
            }
        ]);
        if (soundEnabled) playJarvisBlip();
        toast.success("Telemetry memory cleared");
    };

    const handleResetPosition = () => {
        setResetKey((prev) => prev + 1);
        if (soundEnabled) playJarvisBlip();
        toast.success("HUD position re-centered");
    };

    const handleReadMessage = (text: string) => {
        if (isSpeaking) {
            stopSpeaking();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            speakJarvis(text, () => setIsSpeaking(false));
        }
    };

    return (
        <>
            {/* ══ STARK ARC REACTOR TRIGGER BUTTON (FLOATING HUD ICON) ══ */}
            <div className={`${className} font-sans select-none pointer-events-auto`}>
                <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => {
                        const nextOpen = !isOpen;
                        setIsOpen(nextOpen);
                        setIsMinimized(false);
                        if (soundEnabled) playJarvisChime();
                    }}
                    className="relative group p-2.5 sm:p-3 rounded-full bg-[#070b1a]/95 hover:bg-[#0c142e] border-2 border-sky-400/80 hover:border-cyan-300 shadow-[0_0_35px_rgba(56,189,248,0.5)] text-white flex items-center justify-center cursor-pointer transition-all backdrop-blur-2xl"
                    title="Chat with Mevy - AiRA Lab AI Guide"
                >
                    {/* Rotating Arc Reactor Aura Rings */}
                    <div className="absolute -inset-1.5 rounded-full border border-dashed border-sky-400/50 animate-spin [animation-duration:12s] pointer-events-none" />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-400/40 via-cyan-400/30 to-purple-600/40 blur-md opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {isOpen ? (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sky-300 relative z-10">
                            <X size={22} className="group-hover:rotate-90 transition-transform" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5 px-1 relative z-10">
                            <JarvisAvatar size={36} isSpeaking={isSpeaking} />
                            <div className="flex flex-col items-start text-left pr-2">
                                <span className="font-orbitron font-black text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300 group-hover:to-white transition-colors flex items-center gap-1">
                                    MEVY
                                    <Sparkles size={11} className="text-cyan-300 animate-pulse" />
                                </span>
                                <div className="flex items-center gap-1 text-[9px] text-sky-400/90 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                    <span>AI GUIDE · v4.2</span>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.button>
            </div>

            {/* ══ FULL MEVY / JARVIS HOLOGRAPHIC CHAT HUD PORTAL ══ */}
            {mounted && typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div 
                            style={{ isolation: "isolate" }}
                            className="fixed inset-0 pointer-events-none z-[99999999] flex items-end justify-end p-3 sm:p-6 md:p-8"
                        >
                            <motion.div
                                key={`mevy_chat_${resetKey}`}
                                drag
                                dragMomentum={false}
                                dragElastic={0.05}
                                style={{ isolation: "isolate", transform: "translateZ(0)" }}
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className={`pointer-events-auto w-[95vw] sm:w-[410px] md:w-[450px] bg-[#070b1a] border-2 border-sky-400/60 rounded-3xl shadow-[0_0_70px_rgba(56,189,248,0.35)] flex flex-col overflow-hidden relative transition-all duration-300 z-[99999999] ${
                                    isMinimized ? "h-[68px]" : "h-[580px] max-h-[88vh]"
                                }`}
                            >
                                {/* ══ HOLOGRAPHIC SCANLINES & CYBER CORNERS ══ */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                                
                                {/* Corner Stark Brackets */}
                                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-sky-400 pointer-events-none" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-sky-400 pointer-events-none" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-purple-400 pointer-events-none" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-purple-400 pointer-events-none" />

                                {/* ══ TOP STARK HUD HEADER - DRAG HANDLE ══ */}
                                <div className="p-3 px-4 border-b border-sky-400/30 bg-[#050814] flex items-center justify-between relative z-10 shrink-0 cursor-grab active:cursor-grabbing select-none">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer"
                                        onClick={() => setIsMinimized(!isMinimized)}
                                    >
                                        <JarvisAvatar size={34} isSpeaking={isSpeaking} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-orbitron font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300 tracking-wider">
                                                    MEVY · AI GUIDE
                                                </h3>
                                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 font-mono font-bold flex items-center gap-1">
                                                    <Activity size={9} className="text-emerald-400" /> ONLINE
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                                <span className="text-cyan-400 flex items-center gap-0.5">
                                                    <Cpu size={10} /> NEURAL LINK 99.8%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Header Controls */}
                                    <div className="flex items-center gap-1">
                                        {/* Sound FX Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = !soundEnabled;
                                                setSoundEnabled(next);
                                                if (next) playJarvisBlip();
                                                toast.success(next ? "Sound FX Enabled" : "Sound FX Muted");
                                            }}
                                            className={`p-1.5 rounded-lg border transition-colors ${
                                                soundEnabled
                                                    ? "text-sky-300 border-sky-400/40 bg-sky-950/40"
                                                    : "text-slate-500 border-white/10 hover:text-white"
                                            }`}
                                            title={soundEnabled ? "Mute UI Sound FX" : "Enable Sound FX"}
                                        >
                                            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                                        </button>

                                        {/* Voice Output Read-Aloud Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = !voiceOutputEnabled;
                                                setVoiceOutputEnabled(next);
                                                if (next) {
                                                    playJarvisBlip();
                                                    speakJarvis("Jarvis speech synthesis protocol engaged.");
                                                } else {
                                                    stopSpeaking();
                                                    setIsSpeaking(false);
                                                }
                                                toast.success(next ? "Voice Output Active 🗣️" : "Voice Output Disabled");
                                            }}
                                            className={`p-1.5 rounded-lg border transition-colors ${
                                                voiceOutputEnabled
                                                    ? "text-purple-300 border-purple-500/50 bg-purple-950/60 animate-pulse"
                                                    : "text-slate-500 border-white/10 hover:text-white"
                                            }`}
                                            title={voiceOutputEnabled ? "Disable Jarvis Voice Output" : "Enable Jarvis Voice Output"}
                                        >
                                            <Radio size={13} />
                                        </button>

                                        {/* Position Reset */}
                                        <button
                                            type="button"
                                            onClick={handleResetPosition}
                                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                            title="Reset HUD Position"
                                        >
                                            <RotateCcw size={13} />
                                        </button>

                                        {!isMinimized && (
                                            <button
                                                type="button"
                                                onClick={handleClearChat}
                                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                                title="Purge Memory"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setIsMinimized(!isMinimized)}
                                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                            title={isMinimized ? "Expand HUD" : "Minimize HUD"}
                                        >
                                            {isMinimized ? <Maximize2 size={13} /> : <Minus size={14} />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                stopSpeaking();
                                                setIsSpeaking(false);
                                                setIsOpen(false);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                                            title="Close HUD"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* ══ QUICK DIRECTIVE PROTOCOLS ══ */}
                                {!isMinimized && (
                                    <div className="px-3 py-2 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0 bg-[#060918] border-b border-sky-500/20">
                                        {quickProtocols.map((proto, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleSendMessage(proto.query)}
                                                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-sky-950/80 hover:bg-sky-900 border border-sky-400/40 text-sky-200 transition-all shrink-0 hover:scale-[1.02] shadow-sm flex items-center gap-1 font-mono font-medium"
                                            >
                                                {proto.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* ══ MAIN HOLOGRAPHIC MESSAGE FEED ══ */}
                                {!isMinimized && (
                                    <div
                                        ref={chatScrollRef}
                                        className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth text-xs bg-[#040612]"
                                    >
                                        {messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2.5 group`}
                                            >
                                                {msg.role === "assistant" && (
                                                    <div className="shrink-0 mt-0.5">
                                                        <JarvisAvatar size={26} isSpeaking={isSpeaking} />
                                                    </div>
                                                )}
                                                <div
                                                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed relative ${
                                                        msg.role === "user"
                                                            ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-none shadow-[0_0_20px_rgba(56,189,248,0.3)] border border-sky-300/40"
                                                            : "bg-[#090e24] text-slate-100 border border-sky-400/30 rounded-bl-none shadow-md"
                                                    }`}
                                                >
                                                    {/* Assistant Protocol Prefix */}
                                                    {msg.role === "assistant" && (
                                                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-sky-400/20 text-[9px] font-mono text-sky-300">
                                                            <span className="flex items-center gap-1">
                                                                <Terminal size={10} className="text-cyan-400" />
                                                                DIRECTIVE RESPONSE
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReadMessage(msg.content)}
                                                                className="text-slate-400 hover:text-sky-300 transition-colors p-0.5"
                                                                title="Read message aloud"
                                                            >
                                                                <Volume2 size={11} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="whitespace-pre-wrap font-sans text-xs">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {loading && (
                                            <div className="flex items-center gap-2.5 text-slate-400 text-xs py-1">
                                                <JarvisAvatar size={24} isSpeaking={true} />
                                                <div className="flex gap-1.5 items-center bg-[#090e24] px-3.5 py-2.5 rounded-2xl border border-sky-400/40">
                                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse [animation-delay:150ms]" />
                                                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse [animation-delay:300ms]" />
                                                    <span className="text-[11px] text-sky-300 ml-2 font-mono tracking-wider">
                                                        COMPUTING NEURAL RESPONSE...
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ══ INPUT HUD & VOICE RECORDING CONTROLS ══ */}
                                {!isMinimized && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }}
                                        className="p-3 bg-[#050814] border-t border-sky-400/30 flex items-center gap-2 shrink-0 relative z-10"
                                    >
                                        {/* Microphone Dictation Button */}
                                        <button
                                            type="button"
                                            onClick={toggleVoiceRecording}
                                            className={`p-2.5 rounded-xl border transition-all ${
                                                isRecordingVoice
                                                    ? "bg-rose-600 border-rose-400 text-white animate-ping shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                                                    : "bg-slate-900/90 border-white/10 hover:border-sky-400/60 text-slate-300 hover:text-white"
                                            }`}
                                            title={isRecordingVoice ? "Stop Recording" : "Voice Input Directive 🎙️"}
                                        >
                                            {isRecordingVoice ? <MicOff size={15} /> : <Mic size={15} />}
                                        </button>

                                        <input
                                            type="text"
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder={isRecordingVoice ? "Listening to voice command..." : "Ask Mevy anything..."}
                                            disabled={loading}
                                            className="flex-1 bg-slate-950 border border-white/10 focus:border-sky-400/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors font-mono"
                                        />

                                        <button
                                            type="submit"
                                            disabled={!inputMessage.trim() || loading}
                                            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-all shrink-0 font-bold"
                                            title="Execute Directive"
                                        >
                                            <Send size={15} />
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

export default AiraAiChatbot;
