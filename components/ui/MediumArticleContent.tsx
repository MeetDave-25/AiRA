"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface MediumArticleContentProps {
    content: string;
    className?: string;
    /** "dark" for the member portal, "light" for the neo-brutal public site. */
    variant?: "dark" | "light";
}

/** react-markdown v9+ no longer passes `inline`; treat single-line code without a language as inline. */
function isInlineCode(className: string | undefined, children: any) {
    return !/language-/.test(className || "") && !String(children).includes("\n");
}

function CodeBlock({ children, className, ...props }: any) {
    const [copied, setCopied] = useState(false);
    const codeString = String(children).replace(/\n$/, "");

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="relative my-6 sm:my-8 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/95 shadow-2xl group">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/10 text-xs font-mono text-slate-400 select-none">
                <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-[11px]"
                >
                    {copied ? (
                        <>
                            <Check size={12} className="text-emerald-400" /> Copied
                        </>
                    ) : (
                        <>
                            <Copy size={12} /> Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-sky-100 leading-relaxed">
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        </div>
    );
}

export const mediumMarkdownComponents = {
    p: ({ children }: any) => {
        // Medium style paragraph with generous breathing room and preserved line breaks
        return (
            <p className="mb-6 sm:mb-8 text-[16px] sm:text-[18px] text-slate-200 leading-[1.85] font-normal tracking-[0.01em] whitespace-pre-line">
                {children}
            </p>
        );
    },
    h1: ({ children }: any) => (
        <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-white mt-12 sm:mt-16 mb-6 tracking-tight border-b border-white/10 pb-4">
            {children}
        </h1>
    ),
    h2: ({ children }: any) => (
        <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white mt-12 sm:mt-16 mb-5 tracking-tight border-b border-white/10 pb-3 flex items-center gap-2">
            {children}
        </h2>
    ),
    h3: ({ children }: any) => (
        <h3 className="font-orbitron font-semibold text-xl sm:text-2xl text-sky-300 mt-8 sm:mt-10 mb-4 tracking-tight">
            {children}
        </h3>
    ),
    h4: ({ children }: any) => (
        <h4 className="font-orbitron font-medium text-lg sm:text-xl text-slate-200 mt-6 mb-3">
            {children}
        </h4>
    ),
    // Medium-style Iconic 3-dot Section Divider
    hr: () => (
        <div className="my-12 sm:my-16 flex items-center justify-center select-none">
            <span className="text-2xl sm:text-3xl tracking-[0.8em] font-serif text-sky-400/80 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                · · ·
            </span>
        </div>
    ),
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-sky-400 pl-5 sm:pl-7 my-8 sm:my-10 italic text-lg sm:text-xl text-slate-100 bg-sky-500/[0.05] py-4 pr-5 rounded-r-2xl font-serif leading-relaxed shadow-sm">
            {children}
        </blockquote>
    ),
    ul: ({ children }: any) => (
        <ul className="list-disc list-outside pl-6 mb-6 sm:mb-8 space-y-3 text-[16px] sm:text-[18px] text-slate-200 leading-[1.8]">
            {children}
        </ul>
    ),
    ol: ({ children }: any) => (
        <ol className="list-decimal list-outside pl-6 mb-6 sm:mb-8 space-y-3 text-[16px] sm:text-[18px] text-slate-200 leading-[1.8]">
            {children}
        </ol>
    ),
    li: ({ children }: any) => (
        <li className="pl-1">
            {children}
        </li>
    ),
    code: ({ inline, className, children, ...props }: any) => {
        if (inline ?? isInlineCode(className, children)) {
            return (
                <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-sky-500/15 text-sky-300 font-mono text-[13px] sm:text-[14px] border border-sky-500/30">
                    {children}
                </code>
            );
        }
        return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
    },
    img: ({ src, alt }: any) => (
        <figure className="my-8 sm:my-12">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 group">
                <img
                    src={src}
                    alt={alt || "Article illustration"}
                    className="w-full h-auto object-cover max-h-[600px] transition-transform duration-500 group-hover:scale-[1.01]"
                    loading="lazy"
                />
            </div>
            {alt && (
                <figcaption className="text-center text-xs sm:text-sm text-slate-400 mt-3 italic font-sans">
                    {alt}
                </figcaption>
            )}
        </figure>
    ),
    a: ({ href, children }: any) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-4 decoration-sky-400/50 hover:decoration-sky-300 font-medium transition-colors"
        >
            {children}
        </a>
    ),
    table: ({ children }: any) => (
        <div className="overflow-x-auto my-8 rounded-2xl border border-white/10 shadow-xl bg-slate-950/60">
            <table className="w-full text-left text-sm text-slate-300">
                {children}
            </table>
        </div>
    ),
    th: ({ children }: any) => (
        <th className="p-3.5 bg-slate-900 border-b border-white/10 font-orbitron font-semibold text-white text-xs sm:text-sm">
            {children}
        </th>
    ),
    td: ({ children }: any) => (
        <td className="p-3.5 border-b border-white/5 text-xs sm:text-sm">
            {children}
        </td>
    ),
};

function LightCodeBlock({ children, className, ...props }: any) {
    const [copied, setCopied] = useState(false);
    const codeString = String(children).replace(/\n$/, "");
    return (
        <div className="relative my-8 rounded-2xl overflow-hidden border-2 border-nb-ink bg-nb-ink shadow-nb">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-white/10 text-xs font-mono text-white/60 select-none">
                <span>code</span>
                <button
                    type="button"
                    onClick={() => {
                        navigator.clipboard?.writeText(codeString);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/20 hover:bg-white/10 text-white text-[11px]"
                >
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-nb-paper leading-relaxed">
                <code className={className} {...props}>{children}</code>
            </pre>
        </div>
    );
}

/** Paper-and-ink typography for public pages. */
export const lightMarkdownComponents = {
    p: ({ children }: any) => <p className="mb-[1.2em] text-[1em] text-nb-ink/85 leading-[1.8] whitespace-pre-line">{children}</p>,
    h1: ({ children }: any) => <h1 className="font-brico font-extrabold text-3xl sm:text-4xl tracking-tight mt-12 mb-5">{children}</h1>,
    h2: ({ children }: any) => <h2 className="font-brico font-extrabold text-2xl sm:text-3xl tracking-tight mt-12 mb-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="font-brico font-bold text-xl sm:text-2xl mt-8 mb-3">{children}</h3>,
    h4: ({ children }: any) => <h4 className="font-brico font-bold text-lg mt-6 mb-2">{children}</h4>,
    hr: () => <div className="my-12 text-center font-brico font-extrabold text-2xl tracking-[0.6em] text-nb-violet select-none">✺ ✺ ✺</div>,
    blockquote: ({ children }: any) => (
        <blockquote className="my-8 rounded-2xl border-2 border-nb-ink bg-nb-lilac px-6 py-4 font-brico text-xl leading-snug shadow-nb-sm">{children}</blockquote>
    ),
    ul: ({ children }: any) => <ul className="list-disc list-outside pl-6 mb-[1.2em] space-y-2 text-[1em] text-nb-ink/85 leading-[1.75] marker:text-nb-violet">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-outside pl-6 mb-[1.2em] space-y-2 text-[1em] text-nb-ink/85 leading-[1.75] marker:font-bold">{children}</ol>,
    li: ({ children }: any) => <li className="pl-1">{children}</li>,
    code: ({ inline, className, children, ...props }: any) =>
        inline ?? isInlineCode(className, children) ? (
            <code className="px-1.5 py-0.5 mx-0.5 rounded-md border border-nb-ink/30 bg-nb-sun/60 font-mono text-[0.85em]">{children}</code>
        ) : (
            <LightCodeBlock className={className} {...props}>{children}</LightCodeBlock>
        ),
    img: ({ src, alt }: any) => (
        <figure className="my-10">
            <img src={src} alt={alt || "Article illustration"} loading="lazy" className="w-full h-auto max-h-[600px] object-cover rounded-2xl border-2 border-nb-ink shadow-nb" />
            {alt && <figcaption className="mt-3 text-center font-mono text-xs text-nb-muted">{alt}</figcaption>}
        </figure>
    ),
    a: ({ href, children }: any) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-nb-violet underline decoration-2 underline-offset-4 hover:bg-nb-sun">
            {children}
        </a>
    ),
    table: ({ children }: any) => (
        <div className="overflow-x-auto my-8 rounded-2xl border-2 border-nb-ink bg-white shadow-nb-sm">
            <table className="w-full text-left text-sm">{children}</table>
        </div>
    ),
    th: ({ children }: any) => <th className="p-3 bg-nb-sun border-b-2 border-nb-ink font-brico font-bold">{children}</th>,
    td: ({ children }: any) => <td className="p-3 border-b border-nb-ink/10">{children}</td>,
};

export default function MediumArticleContent({ content, className = "", variant = "dark" }: MediumArticleContentProps) {
    if (!content) return null;

    return (
        <div className={`medium-article-flow ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={variant === "light" ? lightMarkdownComponents : mediumMarkdownComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
