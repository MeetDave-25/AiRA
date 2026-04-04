"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalNetflixIntro() {
    const [show, setShow] = useState(true);

    // Layouts in Next.js App Router don't remount on client navigation, 
    // so this will only run natively on hard initial loads!
    useEffect(() => {
        // Hide after 6.5 seconds so it feels grand
        const t = setTimeout(() => setShow(false), 3500);
        return () => clearTimeout(t);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-aira-bg flex flex-col items-center justify-center overflow-hidden"
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                    {/* Netflix "N" style drop-in line */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute h-screen w-1 bg-gradient-to-b from-aira-cyan via-white to-aira-magenta rounded-full blur-[1px] opacity-20"
                    />

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        className="w-[80vw] max-w-2xl h-1 bg-gradient-to-r from-transparent via-aira-cyan to-transparent rounded-full mb-12 shadow-[0_0_30px_rgba(0,212,255,0.8)]"
                    />

                    <motion.div
                        className="flex flex-col items-center"
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2.0, delay: 1.0, type: "spring", bounce: 0.4 }}
                    >
                        <h1 className="font-orbitron font-black text-[12vw] sm:text-8xl md:text-9xl tracking-tighter leading-none flex drop-shadow-[0_0_40px_rgba(0,212,255,0.5)]">
                            <span className="text-white">AI</span>
                            <span className="text-aira-cyan">R</span>
                            <span className="text-white">A</span>
                        </h1>
                        <motion.p
                            initial={{ opacity: 0, letterSpacing: "0px", y: -20 }}
                            animate={{ opacity: 1, letterSpacing: "0.8em", y: 0 }}
                            transition={{ duration: 2.0, delay: 2.2, ease: "easeOut" }}
                            className="font-orbitron text-aira-purple font-bold text-xl sm:text-3xl mt-4 max-w-full overflow-hidden whitespace-nowrap pl-[0.8em]"
                        >
                            LABS
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 1.8 }}
                        className="w-[60vw] max-w-xl h-[2px] bg-gradient-to-r from-transparent via-aira-magenta to-transparent rounded-full mt-12 shadow-[0_0_30px_rgba(255,0,110,0.8)]"
                    />

                    {/* The signature netflix 3-dot pulse loader, but styled for AIRA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5 }}
                        className="absolute bottom-20 flex gap-3"
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-3 h-3 rounded-full bg-aira-cyan"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
