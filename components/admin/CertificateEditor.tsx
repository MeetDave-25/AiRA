"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    AlignCenter, AlignLeft, AlignRight, Bold, Italic, Minus, Palette,
    Plus, Trash2, Type, LayoutTemplate, ChevronDown
} from "lucide-react";
import type { CertificateDesign, DesignElement, TextAlign } from "@/lib/certificate-types";

// ─── Preview Scale ────────────────────────────────────────────────────────────
const CANVAS_W = 1122;
const CANVAS_H = 794;
const SCALE = 0.56;

// ─── Corner Decorations ───────────────────────────────────────────────────────
function CornerDecorations({ style }: { style: string }) {
    if (style === "none") return null;
    const navy = style === "navy-gold" ? "#0A2540" : "#1E5FA8";
    const gold = style === "navy-gold" ? "#C9A84C" : "#90CAF9";
    return (
        <>
            <div style={{ position: "absolute", top: 0, left: 0, width: 160, height: 160, background: navy, clipPath: "polygon(0 0, 100% 0, 0 100%)", zIndex: 1 }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 180, height: 180, background: gold, clipPath: "polygon(0 0, 22% 0, 0 22%)", zIndex: 1 }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 160, height: 160, background: navy, clipPath: "polygon(100% 100%, 0 100%, 100% 0)", zIndex: 1 }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 180, height: 180, background: gold, clipPath: "polygon(100% 100%, 78% 100%, 100% 78%)", zIndex: 1 }} />
        </>
    );
}

// ─── Element Renderer ─────────────────────────────────────────────────────────
function ElementView({ el, logoUrl, signatureUrl, collegeLogoUrl, recipientName, formattedDate }: {
    el: DesignElement;
    logoUrl: string; signatureUrl: string; collegeLogoUrl: string;
    recipientName: string; formattedDate: string;
}) {
    if (el.type === "divider") {
        return (
            <div style={{
                width: el.width,
                height: el.thickness || 2,
                background: el.id === "name-divider"
                    ? `linear-gradient(to right, transparent, ${el.color || "#C9A84C"}, transparent)`
                    : (el.color || "#C9A84C"),
                opacity: el.opacity ?? 1,
            }} />
        );
    }

    if (el.type === "image") {
        let src = el.imageUrl || "";
        if (el.id === "official-logo") src = logoUrl;
        if (el.id === "signature") src = signatureUrl;
        if (el.id === "college-logo") src = collegeLogoUrl;

        if (!src) {
            return (
                <div style={{
                    width: el.width, height: el.height || 80,
                    border: "2px dashed rgba(10,37,64,0.2)", borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(10,37,64,0.3)", fontSize: 12, textAlign: "center",
                }}>
                    {el.imageAlt || "Image"}
                </div>
            );
        }
        return (
            <img
                src={src}
                crossOrigin="anonymous"
                alt={el.imageAlt || ""}
                style={{ width: el.width, height: el.height || 80, objectFit: el.objectFit || "contain", display: "block" }}
            />
        );
    }

    // text
    let resolvedText = el.text || "";
    if (el.id === "name") resolvedText = recipientName;
    if (el.id === "date") resolvedText = formattedDate;

    return (
        <div style={{
            width: el.width,
            fontSize: el.fontSize || 16,
            fontFamily: el.fontFamily || "Georgia, serif",
            fontWeight: el.fontWeight || "400",
            fontStyle: el.fontStyle || "normal",
            color: el.color || "#000",
            textAlign: el.textAlign || "left",
            opacity: el.opacity ?? 1,
            letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
            textTransform: el.uppercase ? "uppercase" : undefined,
            lineHeight: 1.35,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
        }}>
            {resolvedText}
        </div>
    );
}

// ─── Font Options ─────────────────────────────────────────────────────────────
const FONTS = [
    { label: "Georgia (Serif)", value: "Georgia, serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Montserrat", value: "Montserrat, sans-serif" },
    { label: "Courier", value: "'Courier New', monospace" },
];

const CORNER_THEMES = [
    { label: "Navy & Gold", value: "navy-gold" },
    { label: "Ocean Blue", value: "blue-white" },
    { label: "None", value: "none" },
];

// ─── Main Editor ──────────────────────────────────────────────────────────────
interface CertificateEditorProps {
    design: CertificateDesign;
    onChange: (d: CertificateDesign) => void;
    logoUrl: string;
    signatureUrl: string;
    collegeLogoUrl: string;
    recipientName: string;
    formattedDate: string;
}

export function CertificateEditor({
    design, onChange, logoUrl, signatureUrl, collegeLogoUrl, recipientName, formattedDate,
}: CertificateEditorProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"element" | "background" | "add">("element");
    const canvasRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);

    const selectedEl = design.elements.find(e => e.id === selectedId) || null;

    // ── Update a single element ──────────────────────────────────────────────
    const updateEl = useCallback((id: string, patch: Partial<DesignElement>) => {
        onChange({
            ...design,
            elements: design.elements.map(e => e.id === id ? { ...e, ...patch } : e),
        });
    }, [design, onChange]);

    const deleteEl = useCallback((id: string) => {
        onChange({ ...design, elements: design.elements.filter(e => e.id !== id) });
        setSelectedId(null);
    }, [design, onChange]);

    // ── Drag handlers ────────────────────────────────────────────────────────
    const handleMouseMove = useCallback((e: MouseEvent) => {
        const d = draggingRef.current;
        if (!d) return;
        const dx = (e.clientX - d.startX) / SCALE;
        const dy = (e.clientY - d.startY) / SCALE;
        updateEl(d.id, { x: Math.round(d.elX + dx), y: Math.round(d.elY + dy) });
    }, [updateEl]);

    const handleMouseUp = useCallback(() => { draggingRef.current = null; }, []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
    }, [handleMouseMove, handleMouseUp]);

    // ── Add new element ──────────────────────────────────────────────────────
    const addTextEl = () => {
        const id = `text-${Date.now()}`;
        onChange({
            ...design,
            elements: [...design.elements, {
                id, type: "text", x: 200, y: 400, width: 722,
                text: "New Text", fontSize: 24, fontFamily: "Georgia, serif",
                fontWeight: "400", color: "#0A2540", textAlign: "center",
            }],
        });
        setSelectedId(id);
        setActiveTab("element");
    };

    const addDivider = () => {
        const id = `divider-${Date.now()}`;
        onChange({
            ...design,
            elements: [...design.elements, { id, type: "divider", x: 261, y: 500, width: 600, thickness: 2, color: "#C9A84C", height: 2 }],
        });
        setSelectedId(id);
        setActiveTab("element");
    };

    return (
        <div className="flex gap-4 w-full">
            {/* ── Sidebar Controls ──────────────────────────────────────────── */}
            <div className="w-72 shrink-0 flex flex-col gap-3">
                {/* Tab bar */}
                <div className="flex rounded-xl overflow-hidden border border-white/10">
                    {([["element", "Element"], ["background", "Canvas"], ["add", "+ Add"]] as const).map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-xs font-semibold transition-colors ${activeTab === tab ? "bg-aira-cyan/20 text-aira-cyan" : "text-slate-400 hover:text-white"}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Element panel */}
                {activeTab === "element" && (
                    <div className="glass rounded-2xl p-4 border border-white/5 space-y-4">
                        {!selectedEl ? (
                            <p className="text-slate-400 text-xs text-center pt-6">Click any element on the canvas to edit it</p>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white uppercase tracking-widest opacity-60">{selectedEl.id}</span>
                                    <button onClick={() => deleteEl(selectedEl.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {selectedEl.type === "text" && (
                                    <>
                                        {/* Text content */}
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-1 block uppercase tracking-wider">Text</label>
                                            <textarea
                                                rows={3}
                                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-aira-cyan/50 resize-none"
                                                value={selectedEl.text || ""}
                                                onChange={e => updateEl(selectedEl.id, { text: e.target.value })}
                                            />
                                        </div>
                                        {/* Font family */}
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-1 block uppercase tracking-wider">Font</label>
                                            <select value={selectedEl.fontFamily || "Georgia, serif"}
                                                onChange={e => updateEl(selectedEl.id, { fontFamily: e.target.value })}
                                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none">
                                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                            </select>
                                        </div>
                                        {/* Font size */}
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-1 flex justify-between uppercase tracking-wider">Font Size <span className="text-white">{selectedEl.fontSize || 16}px</span></label>
                                            <input type="range" min={8} max={120} value={selectedEl.fontSize || 16}
                                                onChange={e => updateEl(selectedEl.id, { fontSize: Number(e.target.value) })}
                                                className="w-full accent-aira-cyan" />
                                        </div>
                                        {/* Color */}
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <label className="text-[10px] text-slate-400 mb-1 block uppercase tracking-wider">Color</label>
                                                <input type="color" value={selectedEl.color || "#000000"}
                                                    onChange={e => updateEl(selectedEl.id, { color: e.target.value })}
                                                    className="w-12 h-9 rounded cursor-pointer border border-white/10 bg-transparent" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 mb-1 block uppercase tracking-wider">Hex</label>
                                                <input type="text" value={selectedEl.color || "#000000"}
                                                    onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) updateEl(selectedEl.id, { color: e.target.value }); }}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none" />
                                            </div>
                                        </div>
                                        {/* Style toggles */}
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-2 block uppercase tracking-wider">Style</label>
                                            <div className="flex gap-2 flex-wrap">
                                                <button onClick={() => updateEl(selectedEl.id, { fontWeight: selectedEl.fontWeight === "700" ? "400" : "700" })}
                                                    className={`p-2 rounded-lg border transition-colors ${selectedEl.fontWeight === "700" ? "border-aira-cyan bg-aira-cyan/10 text-aira-cyan" : "border-white/10 text-slate-400"}`}>
                                                    <Bold size={14} />
                                                </button>
                                                <button onClick={() => updateEl(selectedEl.id, { fontStyle: selectedEl.fontStyle === "italic" ? "normal" : "italic" })}
                                                    className={`p-2 rounded-lg border transition-colors ${selectedEl.fontStyle === "italic" ? "border-aira-cyan bg-aira-cyan/10 text-aira-cyan" : "border-white/10 text-slate-400"}`}>
                                                    <Italic size={14} />
                                                </button>
                                                <button onClick={() => updateEl(selectedEl.id, { uppercase: !selectedEl.uppercase })}
                                                    className={`px-3 py-2 rounded-lg border text-xs font-bold transition-colors ${selectedEl.uppercase ? "border-aira-cyan bg-aira-cyan/10 text-aira-cyan" : "border-white/10 text-slate-400"}`}>
                                                    AA
                                                </button>
                                            </div>
                                        </div>
                                        {/* Alignment */}
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-2 block uppercase tracking-wider">Align</label>
                                            <div className="flex gap-2">
                                                {(["left", "center", "right"] as TextAlign[]).map(a => (
                                                    <button key={a} onClick={() => updateEl(selectedEl.id, { textAlign: a })}
                                                        className={`flex-1 p-2 rounded-lg border flex items-center justify-center transition-colors ${selectedEl.textAlign === a ? "border-aira-cyan bg-aira-cyan/10 text-aira-cyan" : "border-white/10 text-slate-400"}`}>
                                                        {a === "left" ? <AlignLeft size={14} /> : a === "center" ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Opacity */}
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-1 flex justify-between uppercase tracking-wider">Opacity <span className="text-white">{Math.round((selectedEl.opacity ?? 1) * 100)}%</span></label>
                                            <input type="range" min={10} max={100} value={Math.round((selectedEl.opacity ?? 1) * 100)}
                                                onChange={e => updateEl(selectedEl.id, { opacity: Number(e.target.value) / 100 })}
                                                className="w-full accent-aira-cyan" />
                                        </div>
                                    </>
                                )}

                                {(selectedEl.type === "divider") && (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <label className="text-[10px] text-slate-400 mb-1 block uppercase tracking-wider">Color</label>
                                                <input type="color" value={selectedEl.color || "#C9A84C"}
                                                    onChange={e => updateEl(selectedEl.id, { color: e.target.value })}
                                                    className="w-12 h-9 rounded cursor-pointer border border-white/10 bg-transparent" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-400 mb-1 flex justify-between uppercase tracking-wider">Thickness <span className="text-white">{selectedEl.thickness || 2}px</span></label>
                                                <input type="range" min={1} max={12} value={selectedEl.thickness || 2}
                                                    onChange={e => updateEl(selectedEl.id, { thickness: Number(e.target.value), height: Number(e.target.value) })}
                                                    className="w-full accent-aira-cyan" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Position / Size (common) */}
                                <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
                                    {[["X", "x"], ["Y", "y"], ["Width", "width"]].map(([label, key]) => (
                                        <div key={key}>
                                            <label className="text-[10px] text-slate-400 mb-1 block uppercase tracking-wider">{label}</label>
                                            <input type="number"
                                                value={(selectedEl as any)[key] || 0}
                                                onChange={e => updateEl(selectedEl.id, { [key]: Number(e.target.value) })}
                                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Background / Canvas panel */}
                {activeTab === "background" && (
                    <div className="glass rounded-2xl p-4 border border-white/5 space-y-4">
                        <div>
                            <label className="text-[10px] text-slate-400 mb-2 block uppercase tracking-wider">Corner Theme</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CORNER_THEMES.map(t => (
                                    <button key={t.value} onClick={() => onChange({ ...design, cornerStyle: t.value as any })}
                                        className={`py-2 text-xs rounded-lg border transition-colors ${design.cornerStyle === t.value ? "border-aira-cyan bg-aira-cyan/10 text-aira-cyan" : "border-white/10 text-slate-400 hover:text-white"}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 mb-2 block uppercase tracking-wider">Background Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {["#FDFCF8", "#FFFFFF", "#EFF3FA", "#0A2540", "#1a1a2e", "#f0fdf4"].map(c => (
                                    <button key={c} onClick={() => onChange({ ...design, background: c })}
                                        className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-aira-cyan transition-colors shadow-md"
                                        style={{ background: c }} title={c}
                                    />
                                ))}
                                <input type="color" onChange={e => onChange({ ...design, background: e.target.value })}
                                    className="w-8 h-8 rounded-full cursor-pointer border border-white/20 bg-transparent" title="Custom" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 mb-2 block uppercase tracking-wider">Frame Color</label>
                            <div className="flex gap-2 items-center">
                                <input type="color" value={design.borderColor}
                                    onChange={e => onChange({ ...design, borderColor: e.target.value })}
                                    className="w-10 h-9 rounded cursor-pointer border border-white/10 bg-transparent" />
                                <input type="text" value={design.borderColor}
                                    onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange({ ...design, borderColor: e.target.value }); }}
                                    className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 mb-1 flex justify-between uppercase tracking-wider">Frame Thickness <span className="text-white">{design.borderThickness}px</span></label>
                            <input type="range" min={1} max={10} value={design.borderThickness}
                                onChange={e => onChange({ ...design, borderThickness: Number(e.target.value) })}
                                className="w-full accent-aira-cyan" />
                        </div>
                    </div>
                )}

                {/* Add elements panel */}
                {activeTab === "add" && (
                    <div className="glass rounded-2xl p-4 border border-white/5 space-y-3">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Add to Canvas</p>
                        <button onClick={addTextEl} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-white transition-colors border border-white/5">
                            <Type size={16} className="text-aira-cyan" /> Text Block
                        </button>
                        <button onClick={addDivider} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-white transition-colors border border-white/5">
                            <Minus size={16} className="text-aira-cyan" /> Divider Line
                        </button>
                    </div>
                )}
            </div>

            {/* ── Canvas ───────────────────────────────────────────────────── */}
            <div className="flex-1 flex items-start justify-center pt-2 overflow-auto">
                <div
                    style={{ width: Math.round(CANVAS_W * SCALE), height: Math.round(CANVAS_H * SCALE), flexShrink: 0, position: "relative" }}
                    onClick={(e) => { if (e.target === e.currentTarget) { setSelectedId(null); setEditingId(null); } }}
                >
                    {/* Actual canvas at full resolution, scaled down */}
                    <div
                        ref={canvasRef}
                        style={{
                            width: CANVAS_W, height: CANVAS_H,
                            transform: `scale(${SCALE})`, transformOrigin: "top left",
                            position: "absolute", top: 0, left: 0,
                            background: design.background.startsWith("#") ? design.background : undefined,
                            fontFamily: "Georgia, serif",
                            boxSizing: "border-box",
                            overflow: "hidden",
                        }}
                    >
                        {/* Gradient background if not plain hex */}
                        {!design.background.startsWith("#") && (
                            <div style={{ position: "absolute", inset: 0, background: design.background, zIndex: 0 }} />
                        )}

                        <CornerDecorations style={design.cornerStyle} />

                        {/* Outer border frame */}
                        <div style={{ position: "absolute", top: 16, left: 16, right: 16, bottom: 16, border: `${design.borderThickness}px solid ${design.borderColor}`, zIndex: 2, pointerEvents: "none" }} />
                        <div style={{ position: "absolute", top: 26, left: 26, right: 26, bottom: 26, border: "1px solid rgba(10,37,64,0.15)", zIndex: 2, pointerEvents: "none" }} />

                        {/* Globe watermark */}
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, opacity: 0.035, pointerEvents: "none", lineHeight: 0 }}>
                            <svg width="500" height="500" viewBox="0 0 24 24" fill="none" stroke="#0A2540" strokeWidth="0.5">
                                <circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" />
                                <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
                                <path d="M4.93 4.93 C 7 8 7 16 4.93 19.07" /><path d="M19.07 4.93 C 17 8 17 16 19.07 19.07" />
                            </svg>
                        </div>

                        {/* Elements */}
                        {design.elements.map(el => (
                            <div
                                key={el.id}
                                style={{
                                    position: "absolute", left: el.x, top: el.y,
                                    zIndex: selectedId === el.id ? 20 : 10,
                                    cursor: "move",
                                    outline: selectedId === el.id ? "2px solid #00D4FF" : "2px solid transparent",
                                    outlineOffset: 3, borderRadius: 2,
                                    userSelect: "none",
                                    transition: "outline-color 0.1s",
                                }}
                                onMouseDown={e => {
                                    e.stopPropagation();
                                    draggingRef.current = { id: el.id, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y };
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    setSelectedId(el.id);
                                    setActiveTab("element");
                                }}
                            >
                                <ElementView
                                    el={el}
                                    logoUrl={logoUrl}
                                    signatureUrl={signatureUrl}
                                    collegeLogoUrl={collegeLogoUrl}
                                    recipientName={recipientName}
                                    formattedDate={formattedDate}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
