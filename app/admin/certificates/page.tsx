"use client";

import { useState, useRef, useEffect } from "react";
import { CertificateTemplate } from "@/components/admin/CertificateTemplate";
import { Award, Download, Users, Plus, Trash2, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function CertificatesPage() {
    const [title, setTitle] = useState("Certificate of Excellence");
    const [eventStr, setEventStr] = useState("Proudly presented at AiRA Lab 2026");
    const [description, setDescription] = useState("has successfully demonstrated exceptional dedication, skill, and commitment to excellence in the core tenets of AI research and application.");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [namesStr, setNamesStr] = useState("John Doe\nJane Smith");
    const [isGenerating, setIsGenerating] = useState(false);

    // An invisible container far off screen intended specifically for pristine high-res rendering
    const hiddenPrintRef = useRef<HTMLDivElement>(null);
    const [printName, setPrintName] = useState(""); // Currently rendering name

    // Load events so admin can easily pull registered users
    useEffect(() => {
        fetch("/api/events")
            .then(res => res.json())
            .then(data => setEvents(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);

    const namesList = namesStr
        .split(/[\n,]+/)
        .map(n => n.trim())
        .filter(n => n.length > 0);

    const loadNamesFromEvent = async () => {
        if (!selectedEventId) return toast.error("Please select an event");
        const toastId = toast.loading("Loading attendees...");
        try {
            const res = await fetch(`/api/events/${selectedEventId}`);
            if (!res.ok) throw new Error("Failed to load event");
            const data = await res.json();

            // Depends on how attendees are stored. Let's assume registrations or we just pull from data.assignments.
            // Wait, standard users/members? Let's just fetch ALL users as a fallback if event has no explicit attendees hook
            const resUsers = await fetch("/api/users");
            const allUsers = await resUsers.json();
            const names = allUsers.map((u: any) => u.name).join("\n");

            setNamesStr(names);
            toast.success("Loaded names!", { id: toastId });
        } catch (error) {
            toast.error("Could not load attendees. You can paste them manually.", { id: toastId });
        }
    };

    const generateSingleCertificate = async (nameToPrint: string): Promise<Blob> => {
        return new Promise<Blob>((resolve, reject) => {
            setPrintName(nameToPrint);
            // Wait for react to render the specific name in the hidden DOM
            setTimeout(async () => {
                if (!hiddenPrintRef.current) return reject("No ref");
                try {
                    const canvas = await html2canvas(hiddenPrintRef.current, {
                        scale: 2, // High resolution (2244 x 1588)
                        useCORS: true,
                        backgroundColor: "#050505",
                        logging: false
                    });

                    // Option to return PDF or Image blob
                    // Image blob is often easier to share directly. Let's do PDF directly via jsPDF.
                    const imgData = canvas.toDataURL("image/jpeg", 0.95);
                    const pdf = new jsPDF({
                        orientation: "landscape",
                        unit: "px",
                        format: [1122, 794]
                    });
                    pdf.addImage(imgData, "JPEG", 0, 0, 1122, 794);
                    const blob = pdf.output("blob");
                    resolve(blob);
                } catch (e) {
                    reject(e);
                }
            }, 300); // 300ms buffer for re-render
        });
    };

    const handleGenerateAll = async () => {
        if (namesList.length === 0) return toast.error("No names provided");
        setIsGenerating(true);
        const toastId = toast.loading(`Generating 0 / ${namesList.length} certificates...`);

        try {
            const zip = new JSZip();
            for (let i = 0; i < namesList.length; i++) {
                const name = namesList[i];
                toast.loading(`Generating ${i + 1} / ${namesList.length}: ${name}`, { id: toastId });
                const blob = await generateSingleCertificate(name);
                zip.file(`Certificate_${name.replace(/[^z0-9]/gi, '_')}.pdf`, blob);
            }

            toast.loading("Zipping files...", { id: toastId });
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `AiRA_Certificates_${eventStr.substring(0, 15).replace(/\s/g, '_')}.zip`);

            toast.success("Certificates Downloaded successfully!", { id: toastId });
        } catch (error: any) {
            toast.error("Generation failed: " + error.message, { id: toastId });
        } finally {
            setIsGenerating(false);
            setPrintName(""); // reset
        }
    };

    const handleGeneratePreview = async () => {
        if (namesList.length === 0) return;
        setIsGenerating(true);
        const toastId = toast.loading("Generating preview PDF...");
        try {
            const blob = await generateSingleCertificate(namesList[0]);
            saveAs(blob, `Preview_${namesList[0]}.pdf`);
            toast.success("Preview downloaded", { id: toastId });
        } catch (error) {
            toast.error("Preview failed", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-2">
                        <Award size={24} className="text-aira-cyan" /> Certificate Engine
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Design and strictly generate bulk signed certificates in PDF format.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleGeneratePreview} disabled={isGenerating || namesList.length === 0} className="px-4 py-2 border border-aira-cyan/30 text-aira-cyan rounded-lg hover:bg-aira-cyan/10 transition-colors disabled:opacity-50">
                        Test Download 1st Name
                    </button>
                    <button onClick={handleGenerateAll} disabled={isGenerating || namesList.length === 0} className="px-4 py-2 bg-gradient-to-r from-aira-cyan to-aira-purple text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2">
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={16} />}
                        Generate All ({namesList.length})
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-2">
                            <Plus size={16} className="text-aira-cyan" /> Details
                        </h3>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Main Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-aira-cyan/50" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Sub-Title / Event Label</label>
                            <input value={eventStr} onChange={e => setEventStr(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-aira-cyan/50" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full resize-none bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-aira-cyan/50 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Sign Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ colorScheme: "dark" }} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-aira-cyan/50" />
                        </div>
                    </div>

                    <div className="glass p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-2">
                            <Users size={16} className="text-aira-purple" /> Names List
                        </h3>
                        {/* Auto load helper */}
                        {events.length > 0 && (
                            <div className="flex gap-2">
                                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2 text-xs text-slate-300">
                                    <option value="">Select an Event...</option>
                                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                                </select>
                                <button onClick={loadNamesFromEvent} className="bg-aira-purple/20 text-aira-purple text-xs px-3 py-2 rounded-lg font-bold hover:bg-aira-purple/30">Load</button>
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Or paste names (comma or next-line separated)</label>
                            <textarea
                                value={namesStr}
                                onChange={e => setNamesStr(e.target.value)}
                                rows={8}
                                className="w-full resize-none bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-aira-purple/50 text-sm leading-relaxed"
                                placeholder="John Doe&#10;Jane Smith"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 text-right">{namesList.length} total names detected</p>
                    </div>
                </div>

                {/* Live Preview Panel */}
                <div className="lg:col-span-2 glass rounded-2xl border border-white/5 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[600px]">
                    <h3 className="absolute top-4 left-4 font-semibold text-sm text-slate-400">Live Customization Preview</h3>
                    <p className="absolute top-4 right-4 text-[10px] text-aira-magenta bg-aira-magenta/10 px-2 py-1 rounded">Scaled for web view</p>

                    {/* The scaled visual preview */}
                    <div className="origin-center lg:origin-left border-8 border-[#0A0A0A] shadow-2xl overflow-hidden mt-8" style={{ transform: "scale(0.55)" }}>
                        <CertificateTemplate
                            name={namesList[0] || "[Preview Name]"}
                            title={title}
                            description={description}
                            date={date}
                            eventStr={eventStr}
                        />
                    </div>
                </div>

            </div>

            {/* HIDDEN PRINT CANVAS. This stays absolutely out of viewport with exact pixel sizing for crisp HTML2Canvas rendering. */}
            <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
                <CertificateTemplate
                    ref={hiddenPrintRef}
                    name={printName}
                    title={title}
                    description={description}
                    date={date}
                    eventStr={eventStr}
                />
            </div>
        </div>
    );
}
