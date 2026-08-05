"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type AnimatedModalProps = {
    open: boolean;
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "md" | "lg";
};

export default function AnimatedModal({
    open,
    title,
    subtitle,
    onClose,
    children,
    footer,
    size = "md",
}: AnimatedModalProps) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                        className={`relative w-full ${size === "lg" ? "max-w-2xl" : "max-w-lg"} max-h-[90dvh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl border border-cyan-400/20 bg-slate-950/95 shadow-[0_0_80px_rgba(0,212,255,0.14)] overflow-hidden z-10`}
                    >
                        <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

                        {/* Modal Header (Fixed) */}
                        <div className="relative border-b border-white/10 p-4 sm:p-5 shrink-0">
                            <div className="pr-10">
                                <h3 className="font-orbitron text-base sm:text-lg font-bold text-white tracking-wide">{title}</h3>
                                {subtitle && <p className="mt-0.5 text-xs sm:text-sm text-slate-400 leading-relaxed">{subtitle}</p>}
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="relative p-4 sm:p-5 flex-1 overflow-y-auto overscroll-contain">
                            {children}
                        </div>

                        {/* Modal Footer (Fixed) */}
                        {footer && (
                            <div className="relative border-t border-white/10 p-3.5 sm:p-4 bg-slate-950/90 shrink-0">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
