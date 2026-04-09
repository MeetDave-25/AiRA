"use client";

import { useState, useEffect } from "react";
import { Check, X, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function ApplicationsPage() {
    const [apps, setApps] = useState<any[]>([]);

    const fetchApps = () => fetch("/api/applications").then(r => r.json()).then(d => setApps(Array.isArray(d) ? d : []));
    useEffect(() => { fetchApps(); }, []);

    const updateStatus = async (id: string, status: string) => {
        await fetch(`/api/applications/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        toast.success(`Marked as ${status}`);
        fetchApps();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "text-aira-green border-aira-green/30 bg-aira-green/10";
            case "REJECTED": return "text-aira-magenta border-aira-magenta/30 bg-aira-magenta/10";
            default: return "text-aira-gold border-aira-gold/30 bg-aira-gold/10";
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5">
                <h1 className="font-orbitron font-bold text-2xl text-white">Join Applications</h1>
                <p className="text-slate-400 text-sm">Review requests to join AiRA Lab</p>
            </div>

            <div className="space-y-4">
                {apps.map(app => (
                    <div key={app.id} className="glass p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg text-white">{app.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(app.status)}`}>
                                    {app.status}
                                </span>
                                {app.interest && <span className="px-2 py-0.5 rounded text-xs border border-aira-cyan/30 text-aira-cyan">{app.interest}</span>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                <a href={`mailto:${app.email}`} className="flex items-center gap-1 hover:text-aira-cyan"><Mail size={14} /> {app.email}</a>
                                {app.phone && <span>📞 {app.phone}</span>}
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-slate-300 text-sm italic">"{app.message}"</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                disabled={app.status === "APPROVED"}
                                onClick={() => updateStatus(app.id, "APPROVED")}
                                className="flex items-center gap-2 px-4 py-2 bg-aira-green/20 text-aira-green border border-aira-green/50 rounded-lg text-sm font-medium hover:bg-aira-green/30 transition-colors disabled:opacity-30"
                            >
                                <Check size={16} /> Approve
                            </button>
                            <button
                                disabled={app.status === "REJECTED"}
                                onClick={() => updateStatus(app.id, "REJECTED")}
                                className="flex items-center gap-2 px-4 py-2 bg-aira-magenta/20 text-aira-magenta border border-aira-magenta/50 rounded-lg text-sm font-medium hover:bg-aira-magenta/30 transition-colors disabled:opacity-30"
                            >
                                <X size={16} /> Reject
                            </button>
                        </div>
                    </div>
                ))}
                {apps.length === 0 && (
                    <div className="glass p-8 rounded-2xl text-center text-slate-500">No applications received yet.</div>
                )}
            </div>
        </div>
    );
}
