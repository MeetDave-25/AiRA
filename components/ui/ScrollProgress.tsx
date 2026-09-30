"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
    return (
        <motion.div
            aria-hidden="true"
            style={{ scaleX }}
            className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[10000] bg-nb-violet pointer-events-none"
        />
    );
}
