"use client";

import { useState, useEffect } from "react";
import { Save, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetch("/api/settings").then(r => r.json()).then(d => setSettings(d));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) toast.success("Settings saved!");
            else throw new Error();
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const body = new FormData();
            body.append("file", file);
            body.append("type", "settings");

            const res = await fetch("/api/upload", {
                method: "POST",
                body,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setSettings((prev) => ({ ...prev, lab_main_image: data.url || prev.lab_main_image }));
            toast.success("Image uploaded");
        } catch (error: any) {
            toast.error(error?.message || "Image upload failed");
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5">
                <h1 className="font-orbitron font-bold text-2xl text-white">Lab Settings</h1>
                <p className="text-slate-400 text-sm">Configure global application variables</p>
            </div>

            <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
                <div>
                    <label className="text-sm text-slate-400 font-medium mb-2 block">About Us - Main Image URL</label>
                    <div className="flex gap-4 items-center">
                        <input
                            type="text"
                            value={settings.lab_main_image || ""}
                            onChange={e => setSettings({ ...settings, lab_main_image: e.target.value })}
                            className="flex-1 px-4 py-3 bg-aira-card border border-white/10 rounded-xl text-white focus:outline-none focus:border-aira-cyan"
                        />
                        <label className="px-4 py-3 rounded-xl border border-aira-cyan/40 text-aira-cyan text-sm cursor-pointer hover:bg-aira-cyan/10 transition">
                            {uploadingImage ? "Uploading..." : "Upload"}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                }}
                            />
                        </label>
                    </div>
                    {settings.lab_main_image && (
                        <img
                            src={settings.lab_main_image}
                            alt="Main preview"
                            className="mt-3 h-24 w-24 rounded-xl object-cover border border-white/10"
                        />
                    )}
                    <p className="text-xs text-aira-cyan mt-2">This is the central glowing image on the beautiful 3D About Page.</p>
                </div>

                <div>
                    <label className="text-sm text-slate-400 font-medium mb-2 block">About Us - Description Text</label>
                    <textarea
                        rows={4}
                        value={settings.lab_about_text || ""}
                        onChange={e => setSettings({ ...settings, lab_about_text: e.target.value })}
                        className="w-full px-4 py-3 bg-aira-card border border-white/10 rounded-xl text-white focus:outline-none focus:border-aira-cyan resize-none"
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-medium rounded-xl hover:shadow-lg hover:shadow-aira-cyan/20 transition-all disabled:opacity-50"
                >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    Save Settings
                </button>
            </div>
        </div>
    );
}
