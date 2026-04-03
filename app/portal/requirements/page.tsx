"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";

export default function RequirementsPage() {
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/tasks")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setTasks(Array.isArray(d) ? d : []))
            .catch(() => setTasks([]));
    }, []);

    const requirements = useMemo(
        () => tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS"),
        [tasks]
    );

    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5">
                <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-2">
                    <ClipboardList size={20} className="text-aira-cyan" /> Requirement Board
                </h1>
                <p className="text-slate-400 text-sm mt-1">Current requirements and deliverables assigned to your scope</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((task) => (
                    <div key={task.id} className="glass p-5 rounded-2xl border border-white/10">
                        <h3 className="text-white font-semibold mb-2">{task.title}</h3>
                        {task.description && <p className="text-sm text-slate-400 mb-3">{task.description}</p>}
                        <div className="text-xs text-slate-500 space-y-1">
                            <p>Team: {task.team?.name || "No Team"}</p>
                            <p>Status: {task.status.replace("_", " ")}</p>
                            {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                        </div>
                    </div>
                ))}
                {requirements.length === 0 && <p className="text-slate-500 text-sm">No requirements available right now.</p>}
            </div>
        </div>
    );
}
