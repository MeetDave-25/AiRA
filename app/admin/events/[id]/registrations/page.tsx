"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, Search, Settings, FileText, Check, X, Eye, Users } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EventRegistrationsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedReg, setSelectedReg] = useState<any>(null);

    useEffect(() => {
        loadRegistrations();
    }, [id]);

    const loadRegistrations = async () => {
        try {
            const res = await fetch(`/api/events/${id}/form/registrations`);
            const data = await res.json();
            setRegistrations(data.registrations || []);
        } catch (error) {
            toast.error("Failed to load registrations");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (regId: string, status: string) => {
        try {
            const res = await fetch(`/api/events/${id}/form/registrations/${regId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            
            // Update local state
            setRegistrations(registrations.map(r => r.id === regId ? { ...r, status } : r));
            if (selectedReg && selectedReg.id === regId) {
                setSelectedReg({ ...selectedReg, status });
            }
            toast.success("Status updated");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleExportCSV = () => {
        if (!registrations.length) return toast.error("No registrations to export");

        // Collect all unique field labels across all answers
        const fieldLabels = new Set<string>();
        registrations.forEach(r => r.answers.forEach((a: any) => fieldLabels.add(a.fieldLabel)));
        const headers = ["Status", "Submitted At", ...Array.from(fieldLabels)];

        // Build CSV rows
        const rows = registrations.map(r => {
            const rowData: Record<string, string> = {
                "Status": r.status,
                "Submitted At": new Date(r.submittedAt).toLocaleString(),
            };
            r.answers.forEach((a: any) => {
                rowData[a.fieldLabel] = a.value;
            });
            return headers.map(h => `"${(rowData[h] || "").replace(/"/g, '""')}"`).join(",");
        });

        const csvContent = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `event_registrations_${id}.csv`);
        link.click();
    };

    const filtered = registrations.filter(r => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return r.answers.some((a: any) => a.value.toLowerCase().includes(term));
    });

    if (loading) return <div className="p-8 text-slate-400 animate-pulse">Loading submissions...</div>;

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link href={`/admin/events/${id}/form`} className="inline-flex items-center gap-2 text-slate-400 hover:text-aira-cyan mb-2 text-sm">
                        <ArrowLeft size={14} /> Back to Form Builder
                    </Link>
                    <h1 className="text-2xl font-orbitron font-bold text-white flex items-center gap-3">
                        <Users size={24} className="text-aira-purple" /> Event Registrations
                    </h1>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/10 flex items-center gap-2 text-sm font-medium transition"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search answers (name, email, etc...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 outline-none focus:border-aira-cyan"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-aira-cyan"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Table */}
                <div className="lg:col-span-2 glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
                                <tr>
                                    <th className="p-4 font-medium">Applicant Name</th>
                                    <th className="p-4 font-medium">Email</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filtered.map((reg) => {
                                    const nameAns = reg.answers.find((a: any) => a.fieldLabel.toLowerCase().includes("name"));
                                    const emailAns = reg.answers.find((a: any) => a.fieldLabel.toLowerCase().includes("email"));
                                    
                                    return (
                                        <tr key={reg.id} className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedReg?.id === reg.id ? "bg-aira-cyan/10 border-l-2 border-aira-cyan" : ""}`} onClick={() => setSelectedReg(reg)}>
                                            <td className="p-4 font-medium text-white">{nameAns?.value || "Unknown"}</td>
                                            <td className="p-4 text-slate-400">{emailAns?.value || "No Email"}</td>
                                            <td className="p-4 text-slate-400">{new Date(reg.submittedAt).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    reg.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                    reg.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {reg.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="p-2 rounded hover:bg-white/10 text-aira-cyan">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            No registrations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Detail View */}
                <div>
                    {selectedReg ? (
                        <div className="glass rounded-2xl border border-white/5 p-5 space-y-6 sticky top-24">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Application Details</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedReg.id, "ACCEPTED")}
                                        className={`p-2 rounded-lg border transition ${selectedReg.status === 'ACCEPTED' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/10 hover:border-green-500 hover:text-green-400 text-slate-400'}`}
                                        title="Accept"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedReg.id, "REJECTED")}
                                        className={`p-2 rounded-lg border transition ${selectedReg.status === 'REJECTED' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/10 hover:border-red-500 hover:text-red-400 text-slate-400'}`}
                                        title="Reject"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {selectedReg.answers.map((ans: any) => (
                                    <div key={ans.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-400 mb-1">{ans.fieldLabel}</p>
                                        <p className="text-sm text-white font-medium break-words">{ans.value || "-"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="glass rounded-2xl border border-white/5 p-8 text-center text-slate-500 sticky top-24">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Select a registration from the table to view full details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
