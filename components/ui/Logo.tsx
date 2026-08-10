import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    showText?: boolean;
    textVariant?: "default" | "portal" | "admin" | "minimal";
    href?: string;
    className?: string;
    imageClassName?: string;
    priority?: boolean;
}

const sizeMap = {
    xs: { box: "w-6 h-6", px: 24, text: "text-sm", subtitle: "text-[9px]" },
    sm: { box: "w-8 h-8", px: 32, text: "text-base", subtitle: "text-[10px]" },
    md: { box: "w-10 h-10", px: 40, text: "text-lg sm:text-xl", subtitle: "text-[11px]" },
    lg: { box: "w-14 h-14", px: 56, text: "text-2xl", subtitle: "text-xs" },
    xl: { box: "w-20 h-20", px: 80, text: "text-3xl", subtitle: "text-sm" },
};

export function Logo({
    size = "md",
    showText = false,
    textVariant = "default",
    href,
    className,
    imageClassName,
    priority = false,
}: LogoProps) {
    const config = sizeMap[size] || sizeMap.md;

    const content = (
        <div className={cn("inline-flex items-center gap-3 group select-none", className)}>
            {/* Logo Emblem Icon */}
            <div
                className={cn(
                    "relative shrink-0 rounded-xl overflow-hidden bg-slate-950/80 border border-white/15 p-0.5 shadow-md shadow-sky-950/40 group-hover:border-sky-400/40 transition-all duration-300 group-hover:scale-105",
                    config.box
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-indigo-500/10 opacity-60 group-hover:opacity-100 transition-opacity" />
                <img
                    src="/logo.png"
                    alt="AiRA Lab Logo"
                    width={config.px}
                    height={config.px}
                    className={cn(
                        "w-full h-full object-contain rounded-lg relative z-10 filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.2)]",
                        imageClassName
                    )}
                />
            </div>

            {/* Optional Brand Text */}
            {showText && (
                <div className="flex flex-col">
                    <span className={cn("font-orbitron font-bold tracking-tight text-white flex items-center", config.text)}>
                        AiRA
                        <span className="text-sky-400 ml-1.5">Lab</span>
                    </span>
                    {textVariant === "portal" && (
                        <span className={cn("text-slate-400 font-orbitron tracking-wider uppercase font-medium", config.subtitle)}>
                            Member Portal
                        </span>
                    )}
                    {textVariant === "admin" && (
                        <span className={cn("text-sky-400/80 font-orbitron tracking-wider uppercase font-semibold", config.subtitle)}>
                            Admin Control
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="inline-flex focus:outline-none">
                {content}
            </Link>
        );
    }

    return content;
}

export default Logo;
