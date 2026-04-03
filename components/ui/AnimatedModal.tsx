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
                    className="fixed inset-0 z-[90] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        className={`relative w-full ${size === "lg" ? "max-w-2xl" : "max-w-lg"} rounded-2xl border border-cyan-400/20 bg-slate-950/95 shadow-[0_0_80px_rgba(0,212,255,0.12)]`}
                    >
                        <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

                        <div className="relative border-b border-white/10 p-5">
                            <div className="pr-10">
                                <h3 className="font-orbitron text-lg font-bold text-white">{title}</h3>
                                {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="relative p-5">{children}</div>

                        {footer && <div className="relative border-t border-white/10 p-5">{footer}</div>}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
