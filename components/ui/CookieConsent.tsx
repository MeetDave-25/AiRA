"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, ShieldCheck, X } from "lucide-react";

export const CONSENT_STORAGE_KEY = "aira_cookie_consent_v1";
const OPEN_EVENT = "aira:open-cookie-settings";

type Consent = { analytics: boolean; ads: boolean; ts: number };

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        adsbygoogle?: any[] & { requestNonPersonalizedAds?: number };
    }
}

function readConsent(): Consent | null {
    try {
        const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Consent) : null;
    } catch {
        return null;
    }
}

function applyConsent(c: Consent) {
    const state = (v: boolean) => (v ? "granted" : "denied");
    window.gtag?.("consent", "update", {
        ad_storage: state(c.ads),
        ad_user_data: state(c.ads),
        ad_personalization: state(c.ads),
        analytics_storage: state(c.analytics),
    });
    window.adsbygoogle = window.adsbygoogle || ([] as any);
    window.adsbygoogle!.requestNonPersonalizedAds = c.ads ? 0 : 1;
}

function saveConsent(c: Consent) {
    try {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(c));
        // Mirror to a first-party cookie so the server can read the choice if ever needed.
        document.cookie = `${CONSENT_STORAGE_KEY}=${c.ads ? "all" : c.analytics ? "analytics" : "essential"}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
    } catch {
        /* storage blocked — consent still applies for this page view */
    }
    applyConsent(c);
}

/** Opens the cookie preferences panel from anywhere (e.g. the footer). */
export function CookieSettingsButton({ className }: { className?: string }) {
    return (
        <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>
            Cookie Settings
        </button>
    );
}

export default function CookieConsent() {
    const [open, setOpen] = useState(false);
    const [customize, setCustomize] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [ads, setAds] = useState(false);

    useEffect(() => {
        const existing = readConsent();
        if (existing) {
            setAnalytics(existing.analytics);
            setAds(existing.ads);
        } else {
            // Small delay so the banner never competes with first paint / LCP.
            const t = setTimeout(() => setOpen(true), 1200);
            return () => clearTimeout(t);
        }
    }, []);

    useEffect(() => {
        const handler = () => {
            setCustomize(true);
            setOpen(true);
        };
        window.addEventListener(OPEN_EVENT, handler);
        return () => window.removeEventListener(OPEN_EVENT, handler);
    }, []);

    const decide = (c: Omit<Consent, "ts">) => {
        saveConsent({ ...c, ts: Date.now() });
        setAnalytics(c.analytics);
        setAds(c.ads);
        setOpen(false);
        setCustomize(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="cookie-title"
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.97 }}
                    transition={{ type: "spring", damping: 24, stiffness: 260 }}
                    className="fixed bottom-3 left-3 right-3 sm:left-5 sm:right-auto sm:bottom-5 sm:max-w-md z-[100000] rounded-2xl border-2 border-[#111] bg-[#F3EFE4] text-[#111] shadow-[6px_6px_0_0_#111] p-5"
                >
                    <button
                        type="button"
                        onClick={() => (readConsent() ? setOpen(false) : decide({ analytics: false, ads: false }))}
                        aria-label="Close and keep only essential cookies"
                        className="absolute top-3 right-3 p-1.5 rounded-lg border-2 border-[#111] bg-white hover:bg-[#FFD84D] transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-center gap-2.5 mb-2">
                        <span className="w-10 h-10 rounded-xl bg-[#FFD84D] border-2 border-[#111] flex items-center justify-center">
                            <Cookie size={18} />
                        </span>
                        <h2 id="cookie-title" className="font-brico font-extrabold text-lg">
                            We value your privacy
                        </h2>
                    </div>

                    <p className="text-[#5E5A52] text-sm leading-relaxed">
                        We use essential cookies to run this site. With your permission we also use cookies for analytics and
                        personalised ads (Google AdSense). Read our{" "}
                        <Link href="/cookies" className="font-semibold text-[#6C5CE7] underline underline-offset-2">Cookie Policy</Link> and{" "}
                        <Link href="/privacy" className="font-semibold text-[#6C5CE7] underline underline-offset-2">Privacy Policy</Link>.
                    </p>

                    {customize && (
                        <div className="mt-4 space-y-2">
                            <Toggle label="Essential" hint="Login, security, preferences. Always on." checked disabled />
                            <Toggle label="Analytics" hint="Helps us understand how the site is used." checked={analytics} onChange={setAnalytics} />
                            <Toggle label="Advertising" hint="Personalised ads by Google AdSense." checked={ads} onChange={setAds} />
                        </div>
                    )}

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        {customize ? (
                            <button
                                type="button"
                                onClick={() => decide({ analytics, ads })}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C5CE7] text-white font-brico border-2 border-[#111] font-bold text-sm shadow-[3px_3px_0_0_#111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                            >
                                Save Preferences
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => decide({ analytics: true, ads: true })}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#6C5CE7] text-white font-brico border-2 border-[#111] font-bold text-sm shadow-[3px_3px_0_0_#111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    Accept All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => decide({ analytics: false, ads: false })}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-white text-[#111] font-brico border-2 border-[#111] font-bold text-sm shadow-[3px_3px_0_0_#111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    Essential Only
                                </button>
                            </>
                        )}
                    </div>
                    {!customize && (
                        <button
                            type="button"
                            onClick={() => setCustomize(true)}
                            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                        >
                            <ShieldCheck size={13} /> Customize choices
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Toggle({
    label,
    hint,
    checked,
    disabled,
    onChange,
}: {
    label: string;
    hint: string;
    checked: boolean;
    disabled?: boolean;
    onChange?: (v: boolean) => void;
}) {
    return (
        <label className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-[#111] bg-white ${disabled ? "opacity-70" : "cursor-pointer"}`}>
            <span>
                <span className="block text-sm font-bold">{label}</span>
                <span className="block text-xs text-[#5E5A52]">{hint}</span>
            </span>
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.checked)}
            />
            <span
                aria-hidden="true"
                className="relative w-11 h-6 shrink-0 rounded-full border-2 border-[#111] bg-[#E6E1D4] transition-colors peer-checked:bg-[#6C5CE7] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6C5CE7]/60 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:border-2 after:border-[#111] after:bg-white after:transition-transform peer-checked:after:translate-x-5"
            />
        </label>
    );
}
