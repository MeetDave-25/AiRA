import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/layout/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
    title: "Privacy Policy",
    description: "How AiRA Lab collects, uses, stores and protects your personal data, and the rights you have under India's DPDP Act, 2023.",
    path: "/privacy",
});

const mail = <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>;

const sections: LegalSection[] = [
    {
        id: "who-we-are",
        title: "Who we are",
        body: (
            <p>
                {siteConfig.name} (&quot;we&quot;, &quot;us&quot;) is a student-run innovation and research lab at {siteConfig.address.street},{" "}
                {siteConfig.address.city}, {siteConfig.address.region}, India. We are the data fiduciary for personal data collected through this
                website. Contact: {mail}.
            </p>
        ),
    },
    {
        id: "data-we-collect",
        title: "Data we collect",
        body: (
            <>
                <p>We only collect data you give us or that is needed to run the site:</p>
                <ul>
                    <li><strong>Membership applications</strong> — name, email, phone, area of interest, message, photo and optional LinkedIn, GitHub or portfolio links.</li>
                    <li><strong>Event registrations</strong> — the fields shown on each event&apos;s form (typically name, email, phone, college and enrolment details).</li>
                    <li><strong>Member / admin accounts</strong> — name, email, hashed password, role, avatar, and content you create (blog posts, projects, reviews, tasks).</li>
                    <li><strong>AI assistant (Mevy)</strong> — the messages you type, which are processed to generate a reply.</li>
                    <li><strong>Technical data</strong> — IP address, browser type, device and pages visited, collected in server logs and, if you consent, by analytics and advertising cookies.</li>
                </ul>
            </>
        ),
    },
    {
        id: "how-we-use",
        title: "How we use your data",
        body: (
            <ul>
                <li>To review applications and contact you about joining the lab.</li>
                <li>To manage event registrations, attendance and certificates.</li>
                <li>To provide the member portal, publish content you submit and send service emails (e.g. password resets, notifications).</li>
                <li>To answer questions through the AI assistant.</li>
                <li>To keep the site secure, prevent abuse and improve performance.</li>
                <li>To show advertising through Google AdSense, which helps fund the lab — personalised only if you consent.</li>
            </ul>
        ),
    },
    {
        id: "legal-basis",
        title: "Consent and legal basis",
        body: (
            <p>
                We process personal data on the basis of your consent (given when you submit a form, create an account or accept cookies) and for
                legitimate uses permitted under the Digital Personal Data Protection Act, 2023. You can withdraw consent at any time by emailing {mail}{" "}
                or, for cookies, via <em>Cookie Settings</em> in the footer. Withdrawal does not affect processing already carried out.
            </p>
        ),
    },
    {
        id: "sharing",
        title: "Service providers we share data with",
        body: (
            <>
                <p>We never sell your data. We use trusted processors who handle data on our behalf:</p>
                <ul>
                    <li><strong>Supabase</strong> — database and file storage.</li>
                    <li><strong>Our hosting provider</strong> — serves the website and keeps server logs.</li>
                    <li><strong>Groq</strong> — processes AI assistant messages to generate replies. Please don&apos;t share sensitive information in the chat.</li>
                    <li><strong>Google AdSense</strong> — displays ads and may use cookies; see Google&apos;s{" "}
                        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">partner-site policy</a>.</li>
                    <li><strong>Email provider</strong> — delivers transactional emails.</li>
                </ul>
                <p>Some providers may process data outside India with appropriate safeguards. We may also disclose data where required by law.</p>
            </>
        ),
    },
    {
        id: "advertising",
        title: "Advertising and third-party cookies",
        body: (
            <>
                <p>
                    We use Google AdSense to show ads that help cover the lab&apos;s hosting costs. Third-party vendors, including Google, use
                    cookies to serve ads based on a user&apos;s prior visits to this website or other websites. Google&apos;s use of advertising
                    cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.
                </p>
                <p>
                    You may opt out of personalised advertising by visiting{" "}
                    <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>, or opt out of some
                    third-party vendors&apos; use of cookies for personalised advertising at{" "}
                    <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>. On this site,
                    ads stay non-personalised unless you allow advertising cookies in <em>Cookie Settings</em>. See our{" "}
                    <Link href="/cookies">Cookie Policy</Link> for details.
                </p>
            </>
        ),
    },
    {
        id: "retention",
        title: "How long we keep data",
        body: (
            <p>
                Applications are kept for up to 12 months after a decision. Event registrations are kept for the academic year plus one year for
                certificate verification. Account data is kept while your account is active and deleted within 90 days of a deletion request, except
                content we must keep for legal reasons. Published content can remain credited to you unless you ask us to remove it.
            </p>
        ),
    },
    {
        id: "your-rights",
        title: "Your rights",
        body: (
            <>
                <p>Under the DPDP Act, 2023 you have the right to:</p>
                <ul>
                    <li>access a summary of the personal data we hold about you;</li>
                    <li>correct, complete or update your data;</li>
                    <li>have your data erased when it is no longer needed;</li>
                    <li>nominate another person to exercise your rights; and</li>
                    <li>raise a grievance with us, and then with the Data Protection Board of India.</li>
                </ul>
                <p>Email {mail} and we will respond within 30 days.</p>
            </>
        ),
    },
    {
        id: "security",
        title: "Security",
        body: (
            <p>
                Data is transmitted over HTTPS, passwords are hashed with bcrypt, and administrative areas are restricted by role. No system is 100%
                secure; if we become aware of a breach affecting you we will notify you and the authorities as required by law.
            </p>
        ),
    },
    {
        id: "children",
        title: "Children",
        body: (
            <p>
                This site is intended for college students and the public aged 18+. If you are under 18, please use the site with a parent or
                guardian&apos;s consent. We do not knowingly target advertising at children.
            </p>
        ),
    },
    {
        id: "cookies",
        title: "Cookies",
        body: (
            <p>
                We use essential cookies and, with your consent, analytics and advertising cookies. See our{" "}
                <Link href="/cookies">Cookie Policy</Link> for details.
            </p>
        ),
    },
    {
        id: "changes",
        title: "Changes and contact",
        body: (
            <p>
                We may update this policy and will change the &quot;Last updated&quot; date above. For any privacy question or grievance, contact
                our grievance officer at {mail} or {siteConfig.phone}.
            </p>
        ),
    },
];

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            path="/privacy"
            intro="Your privacy matters to us. This policy explains what personal data AiRA Lab collects, why we collect it, and the choices you have."
            sections={sections}
        />
    );
}
