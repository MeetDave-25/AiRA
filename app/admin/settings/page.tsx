"use client";

import { useState, useEffect } from "react";
import { 
    Save, 
    UploadCloud, 
    Sparkles, 
    Crown, 
    Globe, 
    Image as ImageIcon, 
    FileText, 
    MessageSquare, 
    Mail, 
    Eye,
    ShieldCheck,
    BarChart3
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { uploadDirectFile } from "@/lib/upload-client";

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [liveStats, setLiveStats] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [activeTab, setActiveTab] = useState<"about" | "leadership" | "milestones" | "contact">("about");

    useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((d) => setSettings(d || {}))
            .catch(() => setSettings({}));

        fetch("/api/public/stats")
            .then((r) => r.json())
            .then((d) => setLiveStats(d.live || d))
            .catch(() => {});
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) toast.success("All lab settings & content updated successfully!");
            else throw new Error();
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file: File, keyName: string = "lab_main_image") => {
        setUploadingImage(true);
        toast.loading("Uploading image...", { id: "upload-status" });
        try {
            const uploaded = await uploadDirectFile(file, { bucket: "uploads", folder: "settings" });
            setSettings((prev) => ({ ...prev, [keyName]: uploaded.url || prev[keyName] }));
            toast.success("Image uploaded successfully!", { id: "upload-status" });
        } catch (error: any) {
            toast.error(error?.message || "Image upload failed", { id: "upload-status" });
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="max-w-5xl space-y-8 mx-auto">
            {/* Header */}
            <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animated-border">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-aira-cyan/20 text-aira-cyan border border-aira-cyan/40">
                            <Sparkles size={20} />
                        </span>
                        <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan">
                            Lab Content & CMS Settings
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                        Customize About Us pictures, leadership banners, founder messages, and public lab copy.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/about"
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs flex items-center gap-2 transition-all"
                    >
                        <Eye size={16} className="text-aira-cyan" /> Preview About
                    </Link>
                    <Link
                        href="/leadership"
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs flex items-center gap-2 transition-all"
                    >
                        <Eye size={16} className="text-amber-400" /> Preview Leaders
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab("about")}
                    className={`px-5 py-2.5 rounded-2xl font-orbitron font-semibold text-xs flex items-center gap-2 transition-all ${
                        activeTab === "about"
                            ? "bg-aira-cyan text-slate-950 shadow-lg shadow-aira-cyan/20 font-bold"
                            : "glass border border-white/10 text-slate-300 hover:text-white"
                    }`}
                >
                    <FileText size={15} /> About Us & Hero
                </button>
                <button
                    onClick={() => setActiveTab("leadership")}
                    className={`px-5 py-2.5 rounded-2xl font-orbitron font-semibold text-xs flex items-center gap-2 transition-all ${
                        activeTab === "leadership"
                            ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 font-bold"
                            : "glass border border-white/10 text-slate-300 hover:text-white"
                    }`}
                >
                    <Crown size={15} /> Leadership & Copy
                </button>
                <button
                    onClick={() => setActiveTab("milestones")}
                    className={`px-5 py-2.5 rounded-2xl font-orbitron font-semibold text-xs flex items-center gap-2 transition-all ${
                        activeTab === "milestones"
                            ? "bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/20 font-bold"
                            : "glass border border-white/10 text-slate-300 hover:text-white"
                    }`}
                >
                    <BarChart3 size={15} /> Statistics & Milestones
                </button>
                <button
                    onClick={() => setActiveTab("contact")}
                    className={`px-5 py-2.5 rounded-2xl font-orbitron font-semibold text-xs flex items-center gap-2 transition-all ${
                        activeTab === "contact"
                            ? "bg-aira-purple text-white shadow-lg shadow-aira-purple/20 font-bold"
                            : "glass border border-white/10 text-slate-300 hover:text-white"
                    }`}
                >
                    <Globe size={15} /> Social & Lab Metadata
                </button>
            </div>

            {/* Form Body */}
            <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
                {activeTab === "about" && (
                    <div className="space-y-6">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="font-orbitron font-bold text-base text-white">About Us Customization</h3>
                            <p className="text-xs text-slate-400">Configure central glowing images and descriptive text on the /about page.</p>
                        </div>

                        {/* Main Image */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                About Us - Main Center Hero Image
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <input
                                    type="text"
                                    value={settings.lab_main_image || ""}
                                    onChange={(e) => setSettings({ ...settings, lab_main_image: e.target.value })}
                                    placeholder="https://... or upload image"
                                    className="flex-1 px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan font-mono"
                                />
                                <label className="px-5 py-3 rounded-xl border border-aira-cyan/40 bg-aira-cyan/15 text-aira-cyan font-semibold text-xs cursor-pointer hover:bg-aira-cyan/25 transition flex items-center justify-center gap-2 shrink-0">
                                    <UploadCloud size={16} />
                                    {uploadingImage ? "Uploading..." : "Upload New Picture"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) void handleImageUpload(file, "lab_main_image");
                                        }}
                                    />
                                </label>
                            </div>
                            {settings.lab_main_image && (
                                <div className="mt-3 flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 border border-white/10">
                                    <img
                                        src={settings.lab_main_image}
                                        alt="Main preview"
                                        className="h-20 w-20 rounded-xl object-cover border border-white/10"
                                    />
                                    <div className="text-xs text-slate-300">
                                        <p className="font-semibold text-white">Central Image Active</p>
                                        <p className="text-slate-400 text-[11px]">Renders in the 3D illuminated frame on the About page.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* About Us Description */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                About Us - Lab Mission & Description
                            </label>
                            <textarea
                                rows={5}
                                value={settings.lab_about_text || ""}
                                onChange={(e) => setSettings({ ...settings, lab_about_text: e.target.value })}
                                placeholder="Enter the comprehensive mission and story of AiRA Lab..."
                                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-aira-cyan resize-none font-sans"
                            />
                        </div>

                        {/* Lab Tagline */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                Lab Tagline / Motto
                            </label>
                            <input
                                type="text"
                                value={settings.lab_tagline || ""}
                                onChange={(e) => setSettings({ ...settings, lab_tagline: e.target.value })}
                                placeholder="e.g., Pioneering Tomorrow's Autonomous Horizons"
                                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-aira-cyan"
                            />
                        </div>
                    </div>
                )}

                {activeTab === "leadership" && (
                    <div className="space-y-6">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="font-orbitron font-bold text-base text-white">Leadership Page Copy</h3>
                            <p className="text-xs text-slate-400">Configure hero text and executive visionary messages on the /leadership page.</p>
                        </div>

                        {/* Leadership Subtitle */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                Leadership Page Hero Subtitle
                            </label>
                            <textarea
                                rows={3}
                                value={settings.leadership_hero_subtitle || ""}
                                onChange={(e) => setSettings({ ...settings, leadership_hero_subtitle: e.target.value })}
                                placeholder="Meet the founders, research directors, and student leaders pioneering cutting-edge artificial intelligence..."
                                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-aira-cyan resize-none"
                            />
                        </div>

                        {/* Founder Vision Message */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                Founder / Executive Message
                            </label>
                            <textarea
                                rows={4}
                                value={settings.founder_quote || ""}
                                onChange={(e) => setSettings({ ...settings, founder_quote: e.target.value })}
                                placeholder="Empowering every ambitious engineer to architect breakthrough autonomous intelligence..."
                                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-aira-cyan resize-none font-sans"
                            />
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                            <span>To manage individual Founder & Leader profiles, photos, and roles:</span>
                            <Link
                                href="/admin/team-members"
                                className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold hover:scale-105 transition-transform shrink-0"
                            >
                                Open Leadership Directory →
                            </Link>
                        </div>
                    </div>
                )}

                {activeTab === "milestones" && (
                    <div className="space-y-6">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="font-orbitron font-bold text-base text-white">Homepage Statistics & Milestones</h3>
                            <p className="text-xs text-slate-400">
                                Stats dynamically calculate from database records by default. You can also specify custom milestone numbers if desired.
                            </p>
                        </div>

                        {/* Live DB Stats Preview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-sky-400/20">
                            <div>
                                <p className="text-[10px] uppercase font-mono text-slate-400">Live Events</p>
                                <p className="text-xl font-bold font-orbitron text-sky-400">{liveStats?.events ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-mono text-slate-400">Live Profiles</p>
                                <p className="text-xl font-bold font-orbitron text-slate-200">{liveStats?.members ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-mono text-slate-400">Live Achievements</p>
                                <p className="text-xl font-bold font-orbitron text-amber-400">{liveStats?.achievements ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-mono text-slate-400">Live Participants</p>
                                <p className="text-xl font-bold font-orbitron text-blue-400">{liveStats?.participants ?? 0}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                    Events Conducted (Leave blank for Live DB Count)
                                </label>
                                <input
                                    type="number"
                                    value={settings.stat_events || ""}
                                    onChange={(e) => setSettings({ ...settings, stat_events: e.target.value })}
                                    placeholder={`Live DB count: ${liveStats?.events ?? 0}`}
                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                    Team Members Count (Leave blank for Live DB Count)
                                </label>
                                <input
                                    type="number"
                                    value={settings.stat_members || ""}
                                    onChange={(e) => setSettings({ ...settings, stat_members: e.target.value })}
                                    placeholder={`Live DB count: ${liveStats?.members ?? 0}`}
                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                    Achievements Count (Leave blank for Live DB Count)
                                </label>
                                <input
                                    type="number"
                                    value={settings.stat_achievements || ""}
                                    onChange={(e) => setSettings({ ...settings, stat_achievements: e.target.value })}
                                    placeholder={`Live DB count: ${liveStats?.achievements ?? 0}`}
                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                    Total Participants (Leave blank for Live DB Count)
                                </label>
                                <input
                                    type="number"
                                    value={settings.stat_participants || ""}
                                    onChange={(e) => setSettings({ ...settings, stat_participants: e.target.value })}
                                    placeholder={`Live DB count: ${liveStats?.participants ?? 0}`}
                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan font-mono"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "contact" && (
                    <div className="space-y-6">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="font-orbitron font-bold text-base text-white">Social & Global Metadata</h3>
                            <p className="text-xs text-slate-400">Configure contact emails, community channels, and social profiles.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                    Official Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.contact_email || ""}
                                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                    placeholder="airalabs@domain.edu"
                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                    GitHub Organization URL
                                </label>
                                <input
                                    type="text"
                                    value={settings.github_url || ""}
                                    onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                                    placeholder="https://github.com/MeetDave-25/AiRA"
                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                    LinkedIn Page URL
                                </label>
                                <input
                                    type="text"
                                    value={settings.linkedin_url || ""}
                                    onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                                    placeholder="https://linkedin.com/company/aira-lab"
                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                                    Discord / Community Server
                                </label>
                                <input
                                    type="text"
                                    value={settings.discord_url || ""}
                                    onChange={(e) => setSettings({ ...settings, discord_url: e.target.value })}
                                    placeholder="https://discord.gg/..."
                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-aira-cyan font-mono"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-aira-cyan via-blue-500 to-aira-purple text-white font-orbitron font-bold text-sm rounded-2xl hover:scale-105 transition-all shadow-xl shadow-aira-cyan/20 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {saving ? "Saving Changes..." : "Save All Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}
