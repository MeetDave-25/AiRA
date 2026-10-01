"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Trash2, Minus, Maximize2, RotateCcw, Sparkles, Volume2, VolumeX, Mic, MicOff, Radio } from "lucide-react";
import toast from "react-hot-toast";
import { playJarvisChime, playJarvisBlip, playJarvisTransmission, speakJarvis, stopSpeaking } from "@/lib/audio";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

// Mevy avatar tile (looping mascot clip) in the neo-brutal style.
export function JarvisAvatar({ size = 38, isSpeaking = false }: { size?: number; isSpeaking?: boolean }) {
    return (
        <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className={`relative shrink-0 rounded-xl overflow-hidden border-2 border-nb-ink bg-nb-lilac select-none ${isSpeaking ? "ring-2 ring-nb-sun ring-offset-1" : ""}`}
        >
            <video
                src="/aira-mascot-loop.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/mascot.png"
                className="w-full h-full object-cover object-center"
                onEnded={(e) => {
                    e.currentTarget.currentTime = 0;
                    e.currentTarget.play().catch(() => {});
                }}
            />
        </div>
    );
}

export function AiraAiChatbot({ className = "fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40" }: { className?: string }) {
    const [mounted, setMounted] = useState(false);
    const [footerInView, setFooterInView] = useState(false);

    useEffect(() => {
        const footer = document.querySelector("footer");
        if (!footer || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(([e]) => setFooterInView(e.isIntersecting), { threshold: 0.05 });
        io.observe(footer);
        return () => io.disconnect();
    }, []);
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
            {/* Floating launcher */}
            <div className={`${className} font-sans select-none pointer-events-auto flex items-center justify-end`}>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative flex items-center"
                >
                    <AnimatePresence>
                        {!isOpen && !footerInView && (
                            <motion.button
                                type="button"
                                initial={{ opacity: 0, x: 10, rotate: 0 }}
                                animate={{ opacity: 1, x: 0, rotate: -2 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={() => { setIsOpen(true); setIsMinimized(false); if (soundEnabled) playJarvisChime(); }}
                                className="mr-3 hidden sm:inline-flex items-center gap-1.5 rounded-full border-2 border-nb-ink bg-nb-sun px-3 py-1.5 font-brico font-bold text-sm text-nb-ink shadow-[3px_3px_0_0_#111]"
                            >
                                <Sparkles size={13} /> Ask Mevy
                                <span className="w-2 h-2 rounded-full border border-nb-ink bg-nb-mint" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        onClick={() => {
                            const nextOpen = !isOpen;
                            setIsOpen(nextOpen);
                            setIsMinimized(false);
                            if (soundEnabled) playJarvisChime();
                        }}
                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-nb-ink bg-nb-lilac text-nb-ink shadow-[4px_4px_0_0_#111] overflow-hidden flex items-center justify-center cursor-pointer"
                        title="Chat with Mevy, the AiRA Lab guide"
                        aria-label={isOpen ? "Close Mevy chat" : "Open Mevy chat"}
                    >
                        {isOpen ? (
                            <X size={24} />
                        ) : (
                            <>
                                <video
                                    src="/aira-mascot-loop.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="auto"
                                    poster="/mascot.png"
                                    className="w-full h-full object-cover object-center"
                                    onEnded={(e) => {
                                        e.currentTarget.currentTime = 0;
                                        e.currentTarget.play().catch(() => {});
                                    }}
                                />
                                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-nb-ink bg-nb-mint" />
                            </>
                        )}
                    </motion.button>
                </motion.div>
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
                                className={`pointer-events-auto w-[95vw] sm:w-[410px] md:w-[440px] bg-nb-paper text-nb-ink border-2 border-nb-ink rounded-[24px] shadow-[8px_8px_0_0_#111] flex flex-col overflow-hidden relative transition-[height] duration-300 z-[99999999] ${
                                    isMinimized ? "h-[68px]" : "h-[580px] max-h-[88vh]"
                                }`}
                            >
                                {/* ══ TOP STARK HUD HEADER - DRAG HANDLE ══ */}
                                <div className="p-3 px-4 border-b-2 border-nb-ink bg-nb-sun flex items-center justify-between relative z-10 shrink-0 cursor-grab active:cursor-grabbing select-none">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer"
                                        onClick={() => setIsMinimized(!isMinimized)}
                                    >
                                        <JarvisAvatar size={34} isSpeaking={isSpeaking} />
                                        <div>
                                            <h3 className="font-brico font-extrabold text-base leading-none">Mevy</h3>
                                            <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-nb-ink/70">
                                                <span className="w-2 h-2 rounded-full border border-nb-ink bg-nb-mint" /> Online
                                            </p>
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
                                            className={`p-1.5 rounded-lg border-2 border-nb-ink transition-colors ${soundEnabled ? "bg-white" : "bg-transparent opacity-50"}`}
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
                                            className={`p-1.5 rounded-lg border-2 border-nb-ink transition-colors ${voiceOutputEnabled ? "bg-nb-violet text-white" : "bg-transparent opacity-50"}`}
                                            title={voiceOutputEnabled ? "Disable Jarvis Voice Output" : "Enable Jarvis Voice Output"}
                                        >
                                            <Radio size={13} />
                                        </button>

                                        {/* Position Reset */}
                                        <button
                                            type="button"
                                            onClick={handleResetPosition}
                                            className="p-1.5 rounded-lg border-2 border-transparent hover:border-nb-ink hover:bg-white transition-colors"
                                            title="Reset HUD Position"
                                        >
                                            <RotateCcw size={13} />
                                        </button>

                                        {!isMinimized && (
                                            <button
                                                type="button"
                                                onClick={handleClearChat}
                                                className="p-1.5 rounded-lg border-2 border-transparent hover:border-nb-ink hover:bg-white transition-colors"
                                                title="Purge Memory"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setIsMinimized(!isMinimized)}
                                            className="p-1.5 rounded-lg border-2 border-transparent hover:border-nb-ink hover:bg-white transition-colors"
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
                                            className="p-1.5 rounded-lg border-2 border-nb-ink bg-white hover:bg-nb-peach transition-colors"
                                            title="Close HUD"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* ══ QUICK DIRECTIVE PROTOCOLS ══ */}
                                {!isMinimized && (
                                    <div className="px-3 py-2.5 overflow-x-auto flex gap-1.5 shrink-0 bg-nb-paper border-b-2 border-nb-ink/15 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-lenis-prevent>
                                        {quickProtocols.map((proto, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleSendMessage(proto.query)}
                                                className="whitespace-nowrap text-xs px-3 py-1 rounded-full border-2 border-nb-ink bg-white font-brico font-bold shadow-[2px_2px_0_0_#111] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all shrink-0 flex items-center gap-1"
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
                                        className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 text-sm bg-white [background-image:radial-gradient(rgba(17,17,17,0.08)_1px,transparent_1px)] [background-size:16px_16px]"
                                        data-lenis-prevent
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
                                                    className={`max-w-[85%] px-3.5 py-3 rounded-2xl leading-relaxed relative border-2 border-nb-ink ${
                                                        msg.role === "user"
                                                            ? "bg-nb-violet text-white rounded-br-md shadow-[3px_3px_0_0_#111]"
                                                            : "bg-nb-paper text-nb-ink rounded-bl-md shadow-[3px_3px_0_0_#111]"
                                                    }`}
                                                >
                                                    {/* Assistant Protocol Prefix */}
                                                    {msg.role === "assistant" && (
                                                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b-2 border-nb-ink/10 font-mono text-[10px] uppercase tracking-[0.12em] text-nb-violet">
                                                            <span>Mevy</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReadMessage(msg.content)}
                                                                className="text-nb-ink/50 hover:text-nb-ink transition-colors p-0.5"
                                                                title="Read message aloud"
                                                            >
                                                                <Volume2 size={11} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="whitespace-pre-wrap font-sans text-[13px]">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {loading && (
                                            <div className="flex items-center gap-2.5 py-1">
                                                <JarvisAvatar size={26} isSpeaking={true} />
                                                <div className="flex gap-1.5 items-center bg-nb-paper px-3.5 py-2.5 rounded-2xl rounded-bl-md border-2 border-nb-ink shadow-[3px_3px_0_0_#111]">
                                                    <span className="w-2 h-2 rounded-full bg-nb-violet animate-bounce" />
                                                    <span className="w-2 h-2 rounded-full bg-nb-violet animate-bounce [animation-delay:150ms]" />
                                                    <span className="w-2 h-2 rounded-full bg-nb-violet animate-bounce [animation-delay:300ms]" />
                                                    <span className="ml-1.5 text-xs text-nb-muted">Mevy is typing…</span>
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
                                        className="p-3 bg-nb-paper border-t-2 border-nb-ink flex items-center gap-2 shrink-0 relative z-10"
                                    >
                                        {/* Microphone Dictation Button */}
                                        <button
                                            type="button"
                                            onClick={toggleVoiceRecording}
                                            className={`p-2.5 rounded-xl border-2 border-nb-ink transition-all ${
                                                isRecordingVoice ? "bg-nb-peach animate-pulse" : "bg-white hover:bg-nb-lilac"
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
                                            className="flex-1 min-w-0 bg-white border-2 border-nb-ink rounded-xl px-3.5 py-2.5 text-sm text-nb-ink placeholder:text-nb-muted/70 outline-none transition-shadow focus:shadow-[3px_3px_0_0_#6C5CE7]"
                                        />

                                        <button
                                            type="submit"
                                            disabled={!inputMessage.trim() || loading}
                                            className="p-2.5 rounded-xl border-2 border-nb-ink bg-nb-violet text-white shadow-[3px_3px_0_0_#111] disabled:opacity-40 disabled:cursor-not-allowed hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#111] transition-all shrink-0"
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
