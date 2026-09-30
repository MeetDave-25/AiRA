import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/layout/LegalPage";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
    title: "Cookie Policy",
    description: "Which cookies and local storage AiRA Lab uses, why, and how to change your cookie preferences.",
    path: "/cookies",
});

const rows: Array<[string, string, string, string]> = [
    ["next-auth.session-token, next-auth.csrf-token", "Essential", "Keeps members and admins signed in securely.", "Session / 30 days"],
    ["aira_cookie_consent_v1", "Essential", "Remembers your cookie choices.", "180 days"],
    ["aira_landing_reveal_seen (session storage)", "Essential", "Plays the intro animation only once per visit.", "Until tab closes"],
    ["event_reg_<id> (local storage)", "Essential", "Remembers that you already registered for an event.", "Until cleared"],
    ["Google AdSense (e.g. __gads, __gpi, IDE)", "Advertising", "Serves and measures ads; personalised only with consent.", "Up to 13 months"],
];

const sections: LegalSection[] = [
    {
        id: "what",
        title: "What are cookies?",
        body: (
            <p>
                Cookies are small text files stored on your device. We also use similar technologies such as local storage. They help the site work
                and, with your permission, help us fund the lab through advertising.
            </p>
        ),
    },
    {
        id: "list",
        title: "Cookies we use",
        body: (
            <div className="overflow-x-auto rounded-xl border-2 border-nb-ink bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-nb-sun font-brico">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Purpose</th>
                            <th className="p-3">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(([name, type, purpose, duration]) => (
                            <tr key={name} className="border-t-2 border-nb-ink/10 align-top">
                                <td className="p-3 font-mono text-[11px] sm:text-xs text-nb-violet break-words">{name}</td>
                                <td className="p-3 whitespace-nowrap">{type}</td>
                                <td className="p-3">{purpose}</td>
                                <td className="p-3 whitespace-nowrap">{duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
    },
    {
        id: "consent-mode",
        title: "How consent works",
        body: (
            <p>
                We use Google Consent Mode v2. Until you choose, advertising and analytics storage are <strong>denied</strong> and Google may only
                show non-personalised ads. Choosing &quot;Accept All&quot; allows personalised ads; &quot;Essential Only&quot; keeps them off.
            </p>
        ),
    },
    {
        id: "manage",
        title: "Change your preferences",
        body: (
            <>
                <p>You can change your choice at any time:</p>
                <CookieSettingsButton className="inline-flex px-5 py-3 rounded-xl border-2 border-nb-ink bg-nb-violet text-white font-brico font-bold shadow-nb transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-nb-sm" />
                <p>
                    You can also block or delete cookies in your browser settings, or opt out of personalised Google ads at{" "}
                    <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>. Blocking essential
                    cookies may stop login from working.
                </p>
            </>
        ),
    },
    {
        id: "more",
        title: "More information",
        body: (
            <p>
                See our <Link href="/privacy">Privacy Policy</Link> or email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
            </p>
        ),
    },
];

export default function CookiesPage() {
    return (
        <LegalPage
            title="Cookie Policy"
            path="/cookies"
            intro="This page explains the cookies and similar technologies AiRA Lab uses and how you can control them."
            sections={sections}
        />
    );
}
