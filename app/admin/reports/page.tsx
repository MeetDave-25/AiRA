"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, CheckSquare, BarChart, Users, ChevronLeft, ChevronRight, Download, FileText, Search, Mail, Shield } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        if (status === "loading") return;
        if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
            router.push("/portal/login");
        } else {
            fetchReports();
        }
    };

    useEffect(() => {
        checkAuth();
    }, [status, session, router]);

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/reports");
            const data = await res.json();
            if (res.ok) {
                setReports(Array.isArray(data) ? data : []);
            } else {
                toast.error(data.error || "Failed to fetch reports");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-aira-bg flex items-center justify-center">
                <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-aira-bg text-white p-6 pb-20 page-enter">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="font-orbitron font-bold text-2xl md:text-3xl text-white">Team Reports</h1>
                        <p className="text-slate-400 mt-1">Review status reports submitted by Team Leads.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 glass rounded-2xl">
                            <FileText className="w-16 h-16 mx-auto text-slate-700 mb-4 opacity-50" />
                            <p className="text-slate-400">No reports have been submitted yet.</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="glass rounded-xl p-6 border border-white/5 hover:border-aira-cyan/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-white font-orbitron">{report.team?.name || "Unknown Team"}</h3>
                                        <p className="text-xs text-aira-cyan mb-1">From: {report.author?.name || "Unknown"} ({report.author?.email})</p>
                                        <p className="text-[10px] text-slate-500">{new Date(report.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {report.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
