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
                "aira-bg": "#07080C",
                "aira-surface": "#0D0F15",
                "aira-card": "#12151D",
                "aira-border": "#1E2330",
                "aira-cyan": "#38BDF8",
                "aira-magenta": "#E2E8F0",
                "aira-purple": "#60A5FA",
                "aira-gold": "#F59E0B",
                "aira-green": "#10B981",
                "neon-green": "#00FF66",
                "neon-bright": "#00FF7F",
                "neon-black": "#000000",
                "neon-dark": "#08080A",
                "neon-card": "#0D0D10",
                "neon-border": "rgba(0, 255, 102, 0.3)",
                // Homepage neo-brutal palette: warm paper, hard ink lines, AiRA violet + four block colours.
                "nb-paper": "#F3EFE4",
                "nb-ink": "#111111",
                "nb-muted": "#5E5A52",
                "nb-violet": "#6C5CE7",
                "nb-sky": "#9DD6FF",
                "nb-peach": "#FFB48A",
                "nb-mint": "#A8EFC9",
                "nb-lilac": "#D6CEFF",
                "nb-sun": "#FFD84D",
            },
            fontFamily: {
                // `font-orbitron` is used across ~460 headings; it now maps to the modern display face.
                // The original Orbitron wordmark is kept only for the logo via `font-brand`.
                orbitron: ["var(--font-display)", "Inter Tight", "sans-serif"],
                display: ["var(--font-display)", "Inter Tight", "sans-serif"],
                brand: ["var(--font-orbitron)", "Orbitron", "sans-serif"],
                mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
                brico: ["var(--font-brico)", "Bricolage Grotesque", "sans-serif"],
                grotesk: ["var(--font-grotesk)", "Space Grotesk", "sans-serif"],
                inter: ["var(--font-display)", "Inter Tight", "sans-serif"],
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
            boxShadow: {
                // Hard offset shadows — the neo-brutal signature.
                "nb-sm": "3px 3px 0 0 #111111",
                nb: "5px 5px 0 0 #111111",
                "nb-lg": "8px 8px 0 0 #111111",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};
