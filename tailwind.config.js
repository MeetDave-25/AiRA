/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "aira-bg": "#060B14",
                "aira-surface": "#0C1424",
                "aira-card": "#101B30",
                "aira-border": "#1E2E48",
                "aira-cyan": "#38BDF8",
                "aira-magenta": "#E2E8F0",
                "aira-purple": "#60A5FA",
                "aira-gold": "#F59E0B",
                "aira-green": "#10B981",
            },
            fontFamily: {
                orbitron: ["Orbitron", "sans-serif"],
                grotesk: ["Space Grotesk", "sans-serif"],
                inter: ["Inter", "sans-serif"],
            },
            animation: {
                "spin-slow": "spin 8s linear infinite",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
                "float": "float 6s ease-in-out infinite",
                "slide-up": "slideUp 0.6s ease-out",
                "fade-in": "fadeIn 0.5s ease-out",
                "netflix-bar": "netflixBar 0.5s ease-out forwards",
                "orbit": "orbit 20s linear infinite",
            },
            keyframes: {
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(56, 189, 248, 0.25)" },
                    "50%": { boxShadow: "0 0 45px rgba(56, 189, 248, 0.55)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                netflixBar: {
                    "0%": { width: "0%" },
                    "100%": { width: "100%" },
                },
                orbit: {
                    "0%": { transform: "rotate(0deg) translateX(280px) rotate(0deg)" },
                    "100%": { transform: "rotate(360deg) translateX(280px) rotate(-360deg)" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "hero-glow": "radial-gradient(ellipse at center, rgba(56,189,248,0.18) 0%, transparent 70%)",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};
