"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, GripVertical, Plus, Save, Trash2, Eye, ExternalLink, Settings, Users } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EventFormBuilderPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();

    const [form, setForm] = useState<any>(null);
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // New field state
    const [showNewField, setShowNewField] = useState(false);
    const [newField, setNewField] = useState({
        label: "",
        fieldType: "text",
        isRequired: false,
        placeholder: "",
        options: "",
    });

    useEffect(() => {
        loadForm();
    }, [id]);

    const loadForm = async () => {
        try {
            const res = await fetch(`/api/events/${id}/form`);
            const data = await res.json();
            if (data.form) {
                setForm(data.form);
                setFields(data.form.fields || []);
            }
        } catch (error) {
            toast.error("Failed to load form");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateForm = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/events/${id}/form`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isOpen: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setForm(data.form);
            setFields(data.form.fields || []);
            toast.success("Form created successfully!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateFormSettings = async (updates: any) => {
        try {
            const res = await fetch(`/api/events/${id}/form`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setForm(data.form);
            toast.success("Form settings updated");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleAddField = async () => {
        if (!newField.label.trim()) return toast.error("Field label is required");

        setSaving(true);
        try {
            const optionsArray = newField.options
                .split(",")
                .map((o) => o.trim())
                .filter(Boolean);

            const res = await fetch(`/api/events/${id}/form/fields`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: newField.label,
                    fieldType: newField.fieldType,
                    isRequired: newField.isRequired,
                    placeholder: newField.placeholder,
                    options: optionsArray,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setFields([...fields, data.field]);
            setShowNewField(false);
            setNewField({ label: "", fieldType: "text", isRequired: false, placeholder: "", options: "" });
            toast.success("Field added");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteField = async (fieldId: string) => {
        if (!confirm("Remove this field?")) return;
        try {
            const res = await fetch(`/api/events/${id}/form/fields/${fieldId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setFields(fields.filter((f) => f.id !== fieldId));
            toast.success("Field removed");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleMoveField = async (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= fields.length) return;
        
        const newFields = [...fields];
        const temp = newFields[index];
        newFields[index] = newFields[index + direction];
        newFields[index + direction] = temp;

        // Update sortOrder
        const updated = newFields.map((f, i) => ({ ...f, sortOrder: i }));
        setFields(updated);

        // Save order to backend
        try {
            await fetch(`/api/events/${id}/form/fields`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields: updated }),
            });
        } catch (e) {
            toast.error("Failed to save order");
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-400 animate-pulse">Loading form data...</div>;
    }

    if (!form) {
        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto mt-10">
                <Link href="/admin/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-aira-cyan mb-8">
                    <ArrowLeft size={16} /> Back to Events
                </Link>
                <div className="glass rounded-2xl p-10 text-center border border-white/5">
                    <div className="w-16 h-16 bg-aira-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus size={32} className="text-aira-cyan" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Registration Form</h2>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        This event doesn't have a registration form yet. Create one to allow users to sign up and collect custom information.
                    </p>
                    <button
                        onClick={handleCreateForm}
                        disabled={saving}
                        className="bg-aira-cyan text-aira-bg font-semibold px-6 py-3 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition"
                    >
                        {saving ? "Creating..." : "Create Event Form"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-aira-cyan mb-2 text-sm">
                        <ArrowLeft size={14} /> Back to Events
                    </Link>
                    <h1 className="text-2xl font-orbitron font-bold text-white">Form Builder</h1>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/events/${id}`}
                        target="_blank"
                        className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 flex items-center gap-2 text-sm"
                    >
                        <ExternalLink size={14} /> View Public Event
                    </Link>
                    <Link
                        href={`/admin/events/${id}/registrations`}
                        className="px-4 py-2 rounded-lg bg-aira-purple/20 text-aira-purple hover:bg-aira-purple/30 border border-aira-purple/30 flex items-center gap-2 text-sm font-medium"
                    >
                        <Users size={14} /> View Submissions
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Form Settings */}
                <div className="space-y-6">
                    <div className="glass rounded-2xl p-5 border border-white/5">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-aira-cyan flex items-center gap-2 mb-4">
                            <Settings size={16} /> Form Settings
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div>
                                    <p className="text-sm font-medium text-slate-200">Accept Registrations</p>
                                    <p className="text-xs text-slate-400">Toggle public form visibility</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={form.isOpen}
                                        onChange={(e) => handleUpdateFormSettings({ isOpen: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aira-cyan"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Registration Deadline (Optional)</label>
                                <input
                                    type="datetime-local"
                                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-aira-cyan"
                                    value={form.deadline ? new Date(form.deadline).toISOString().slice(0, 16) : ""}
                                    onChange={(e) => handleUpdateFormSettings({ deadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Maximum Slots (Optional)</label>
                                <input
                                    type="number"
                                    placeholder="Leave empty for unlimited"
                                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-aira-cyan"
                                    value={form.maxSlots || ""}
                                    onChange={(e) => handleUpdateFormSettings({ maxSlots: e.target.value ? parseInt(e.target.value) : null })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Fields */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass rounded-2xl p-5 border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                Form Fields
                            </h2>
                            <button
                                onClick={() => setShowNewField(!showNewField)}
                                className="px-3 py-1.5 rounded-lg bg-aira-cyan/20 text-aira-cyan hover:bg-aira-cyan/30 text-xs font-medium flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Add Custom Field
                            </button>
                        </div>

                        {showNewField && (
                            <div className="mb-6 p-4 rounded-xl border border-aira-cyan/30 bg-aira-cyan/5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Field Label *</label>
                                        <input
                                            value={newField.label}
                                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-aira-cyan"
                                            placeholder="e.g. Diet Preference"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Field Type</label>
                                        <select
                                            value={newField.fieldType}
                                            onChange={(e) => setNewField({ ...newField, fieldType: e.target.value })}
                                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-aira-cyan"
                                        >
                                            <option value="text">Short Text</option>
                                            <option value="textarea">Long Text</option>
                                            <option value="select">Dropdown Select</option>
                                            <option value="radio">Radio Buttons</option>
                                            <option value="checkbox">Checkbox</option>
                                        </select>
                                    </div>
                                </div>
                                {['select', 'radio'].includes(newField.fieldType) && (
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Options (Comma separated)</label>
                                        <input
                                            value={newField.options}
                                            onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-aira-cyan"
                                            placeholder="e.g. Veg, Non-Veg, Vegan"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newField.isRequired}
                                            onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
                                            className="w-4 h-4 rounded bg-slate-900 border-white/20 text-aira-cyan"
                                        />
                                        <span className="text-sm text-slate-300">Required Field</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowNewField(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
                                        <button onClick={handleAddField} disabled={saving} className="px-3 py-1.5 rounded-lg bg-aira-cyan text-aira-bg font-semibold text-xs disabled:opacity-50">
                                            {saving ? "Saving..." : "Save Field"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {fields.map((field, idx) => (
                                <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group">
                                    <div className="flex flex-col gap-1 text-slate-500">
                                        <button onClick={() => handleMoveField(idx, -1)} disabled={idx === 0} className="hover:text-white disabled:opacity-30"><GripVertical size={14} /></button>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-slate-200 text-sm">{field.label}</span>
                                            {field.isRequired && <span className="text-aira-magenta text-xs">*</span>}
                                            {field.isBuiltIn && <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-400">Built-in</span>}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Type: {field.fieldType} {field.options?.length > 0 && ` • Options: ${field.options.join(", ")}`}
                                        </div>
                                    </div>
                                    {!field.isBuiltIn && (
                                        <button
                                            onClick={() => handleDeleteField(field.id)}
                                            className="p-2 rounded hover:bg-aira-magenta/20 text-aira-magenta opacity-0 group-hover:opacity-100 transition"
                                            title="Delete field"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
