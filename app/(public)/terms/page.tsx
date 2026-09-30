import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/layout/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
    title: "Terms of Use",
    description: "The terms that govern your use of the AiRA Lab website, member portal, events and content.",
    path: "/terms",
});

const sections: LegalSection[] = [
    {
        id: "acceptance",
        title: "Acceptance of terms",
        body: (
            <p>
                By using {siteConfig.name}&apos;s website, member portal or services you agree to these Terms and our{" "}
                <Link href="/privacy">Privacy Policy</Link>. If you do not agree, please do not use the site.
            </p>
        ),
    },
    {
        id: "accounts",
        title: "Accounts",
        body: (
            <p>
                Portal accounts are issued to lab members by administrators. Keep your credentials confidential; you are responsible for activity
                under your account. We may suspend accounts that break these Terms or the college&apos;s code of conduct.
            </p>
        ),
    },
    {
        id: "content",
        title: "Your content",
        body: (
            <p>
                You keep ownership of blogs, projects, reviews and media you submit. By submitting, you grant {siteConfig.name} a non-exclusive,
                royalty-free licence to host, display, edit for formatting and promote that content on our website, magazine and social channels
                with credit to you. You confirm you have the right to share it and that it does not infringe anyone else&apos;s rights.
            </p>
        ),
    },
    {
        id: "acceptable-use",
        title: "Acceptable use",
        body: (
            <>
                <p>You agree not to:</p>
                <ul>
                    <li>post unlawful, hateful, harassing, obscene or misleading content;</li>
                    <li>plagiarise or upload work you don&apos;t have rights to;</li>
                    <li>attempt to gain unauthorised access, scrape at scale, or disrupt the site;</li>
                    <li>submit false information in applications or event registrations; or</li>
                    <li>misuse the AI assistant to generate harmful content.</li>
                </ul>
            </>
        ),
    },
    {
        id: "events",
        title: "Events and certificates",
        body: (
            <p>
                Event details may change or be cancelled. Registration does not guarantee a seat. Certificates are issued based on attendance and
                eligibility and can be revoked if obtained through false information.
            </p>
        ),
    },
    {
        id: "ai",
        title: "AI assistant",
        body: (
            <p>
                Mevy, our AI assistant, can make mistakes. Its answers are for general guidance only and are not official statements of the lab or
                college. Verify important information with the team.
            </p>
        ),
    },
    {
        id: "ip",
        title: "Intellectual property",
        body: (
            <p>
                The {siteConfig.name} name, logo, mascot, design and original site content belong to {siteConfig.name} or its licensors. You may
                share links and short quotes with attribution, but may not copy the design or branding without permission.
            </p>
        ),
    },
    {
        id: "third-party",
        title: "Third-party links and ads",
        body: (
            <p>
                The site links to third-party websites and shows ads served by Google. We are not responsible for their content, products or
                privacy practices.
            </p>
        ),
    },
    {
        id: "liability",
        title: "Disclaimer and limitation of liability",
        body: (
            <p>
                The site is provided &quot;as is&quot;. To the extent permitted by law, {siteConfig.name} is not liable for indirect or consequential
                loss arising from use of the site, and we do not guarantee it will always be available or error-free.
            </p>
        ),
    },
    {
        id: "law",
        title: "Governing law and contact",
        body: (
            <p>
                These Terms are governed by the laws of India, with courts at {siteConfig.address.city}, {siteConfig.address.region} having
                jurisdiction. Questions? Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
            </p>
        ),
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms of Use"
            path="/terms"
            intro="Please read these terms carefully. They explain the rules for using the AiRA Lab website, member portal and events."
            sections={sections}
        />
    );
}
