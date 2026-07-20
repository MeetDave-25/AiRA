"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Download } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { compressImage } from "@/lib/image-compressor";
import { defaultDesign, type CertificateDesign } from "@/lib/certificate-types";
import { CertificateEditor } from "@/components/admin/CertificateEditor";
import { CertificateTemplate } from "@/components/admin/CertificateTemplate";

export default function CertificatesPage() {
    const [design, setDesign] = useState<CertificateDesign>(defaultDesign());
    const [logoUrl, setLogoUrl] = useState("");
    const [signatureUrl, setSignatureUrl] = useState("");
    const [collegeLogoUrl, setCollegeLogoUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);

    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [namesStr, setNamesStr] = useState("John Doe\nJane Smith");
    const [isGenerating, setIsGenerating] = useState(false);

    const hiddenPrintRef = useRef<HTMLDivElement>(null);
    const [printName, setPrintName] = useState("");

    useEffect(() => {
        fetch("/api/events")
            .then(r => r.json())
            .then(d => setEvents(Array.isArray(d) ? d : []))
            .catch(() => { });
    }, []);

    const namesList = namesStr.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);

    const formattedDate = (() => { try { return format(new Date(), "MMMM d, yyyy"); } catch { return ""; } })();
    const printFormattedDate = (() => { try { return format(new Date(), "MMMM d, yyyy"); } catch { return ""; } })();

    const loadNamesFromEvent = async () => {
        if (!selectedEventId) return toast.error("Please select an event");
        const id = toast.loading("Loading attendees...");
        try {
            const res = await fetch("/api/users");
            const users = await res.json();
            setNamesStr(users.map((u: any) => u.name).join("\n"));
            toast.success("Names loaded!", { id });
        } catch {
            toast.error("Could not load names. Paste manually.", { id });
        }
    };

    const handleImageUpload = async (file: File, type: "logoUrl" | "signatureUrl" | "collegeLogoUrl") => {
        setUploadingImage(true);
        const id = toast.loading("Uploading...");
        try {
            const compressed = await compressImage(file);
            const body = new FormData();
            body.append("file", compressed);
            body.append("type", "certificate_" + type);
            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Upload failed");
            if (type === "logoUrl") setLogoUrl(data.url);
            if (type === "signatureUrl") setSignatureUrl(data.url);
            if (type === "collegeLogoUrl") setCollegeLogoUrl(data.url);
            toast.success("Uploaded!", { id });
        } catch (e: any) {
            toast.error(e?.message || "Upload failed", { id });
        } finally {
            setUploadingImage(false);
        }
    };

    const generateSinglePDF = async (name: string): Promise<Blob> => {
        return new Promise<Blob>((resolve, reject) => {
            setPrintName(name);
            setTimeout(async () => {
                if (!hiddenPrintRef.current) return reject("No ref");
                try {
                    const canvas = await html2canvas(hiddenPrintRef.current, {
                        scale: 2, useCORS: true, backgroundColor: "#FDFCF8", logging: false,
                    });
                    const imgData = canvas.toDataURL("image/jpeg", 0.95);
                    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1122, 794] });
                    pdf.addImage(imgData, "JPEG", 0, 0, 1122, 794);
                    resolve(pdf.output("blob"));
                } catch (e) { reject(e); }
            }, 250);
        });
    };

    const handleGenerateAll = async () => {
        if (!namesList.length) return toast.error("No names provided");
        setIsGenerating(true);
        const id = toast.loading(`Generating 0 / ${namesList.length}…`);
        try {
            const zip = new JSZip();
            for (let i = 0; i < namesList.length; i++) {
                const n = namesList[i];
                toast.loading(`Generating ${i + 1} / ${namesList.length}: ${n}`, { id });
                zip.file(`Certificate_${n.replace(/[^a-z0-9]/gi, "_")}.pdf`, await generateSinglePDF(n));
            }
            toast.loading("Zipping…", { id });
            saveAs(await zip.generateAsync({ type: "blob" }), `AiRA_Certificates.zip`);
            toast.success("Downloaded!", { id });
        } catch (e: any) {
            toast.error("Failed: " + e?.message, { id });
        } finally {
            setIsGenerating(false);
            setPrintName("");
        }
    };

    const handlePreview = async () => {
        if (!namesList.length) return;
        setIsGenerating(true);
        const id = toast.loading("Generating preview…");
        try {
            saveAs(await generateSinglePDF(namesList[0]), `Preview_${namesList[0]}.pdf`);
            toast.success("Preview ready!", { id });
        } catch { toast.error("Failed", { id }); }
        finally { setIsGenerating(false); }
    };

    return (
        <div className="space-y-4">

            {/* Top bar */}
            <div className="glass p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-2">
                        <Award size={22} className="text-aira-cyan" /> Certificate Designer
                    </h1>
                    <p className="text-slate-400 text-sm mt-0.5">Design, personalise, and bulk-generate certificates. Drag any element to reposition it.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={handlePreview} disabled={isGenerating || !namesList.length} className="px-4 py-2 border border-aira-cyan/30 text-aira-cyan rounded-lg hover:bg-aira-cyan/10 transition-colors disabled:opacity-50 text-sm">
                        Preview PDF
                    </button>
                    <button onClick={handleGenerateAll} disabled={isGenerating || !namesList.length} className="px-5 py-2 bg-gradient-to-r from-aira-cyan to-aira-purple text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2 text-sm">
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={15} />}
                        Generate All ({namesList.length})
                    </button>
                </div>
            </div>

            {/* Branding uploads + Names — compact row */}
            <div className="glass p-5 rounded-2xl border border-white/5 flex flex-wrap gap-6 items-start">
                {/* Uploads */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Branding Assets</p>
                    {([
                        ["Official Logo", "logoUrl", logoUrl],
                        ["College Logo", "collegeLogoUrl", collegeLogoUrl],
                        ["Director Signature", "signatureUrl", signatureUrl],
                    ] as const).map(([label, key, url]) => (
                        <label key={key} className={`flex items-center justify-between px-3 py-2 rounded-lg border border-dashed cursor-pointer text-xs transition-colors ${url ? "border-aira-green text-aira-green bg-aira-green/5" : "border-white/20 text-slate-300 hover:border-aira-cyan hover:text-aira-cyan"}`}>
                            <span>{url ? `✓ ${label}` : `Upload ${label}`}</span>
                            <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0], key); }} />
                        </label>
                    ))}
                </div>

                {/* Names */}
                <div className="flex-1 min-w-[240px] flex flex-col gap-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Recipient Names</p>
                    {events.length > 0 && (
                        <div className="flex gap-2">
                            <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300">
                                <option value="">Select an Event…</option>
                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                            </select>
                            <button onClick={loadNamesFromEvent} className="bg-aira-purple/20 text-aira-purple text-xs px-3 rounded-lg hover:bg-aira-purple/30 font-bold">Load</button>
                        </div>
                    )}
                    <textarea value={namesStr} onChange={e => setNamesStr(e.target.value)} rows={4}
                        className="w-full resize-none bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-aira-purple/50 leading-relaxed"
                        placeholder="One name per line, or comma-separated" />
                    <p className="text-[10px] text-slate-500 text-right">{namesList.length} names</p>
                </div>
            </div>

            {/* MAIN VISUAL EDITOR */}
            <div className="glass rounded-2xl border border-white/5 p-5">
                <CertificateEditor
                    design={design}
                    onChange={setDesign}
                    logoUrl={logoUrl}
                    signatureUrl={signatureUrl}
                    collegeLogoUrl={collegeLogoUrl}
                    recipientName={namesList[0] || "Preview Name"}
                    formattedDate={formattedDate}
                />
            </div>

            {/* HIDDEN PRINT CANVAS — off-screen, full resolution */}
            <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
                <CertificateTemplate
                    ref={hiddenPrintRef}
                    design={design}
                    recipientName={printName}
                    formattedDate={printFormattedDate}
                    logoUrl={logoUrl}
                    signatureUrl={signatureUrl}
                    collegeLogoUrl={collegeLogoUrl}
                />
            </div>
        </div>
    );
}
