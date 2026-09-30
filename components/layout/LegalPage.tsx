import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/site";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
    { href: "/cookies", label: "Cookie Policy" },
];

/** Shared, server-rendered layout for Privacy / Terms / Cookie pages. */
export default function LegalPage({
    title,
    intro,
    path,
    sections,
}: {
    title: string;
    intro: string;
    path: string;
    sections: LegalSection[];
}) {
    const updated = new Date(siteConfig.legalUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return (
        <div className="px-5 sm:px-8 lg:px-12 max-w-[1360px] mx-auto pt-32 sm:pt-36 pb-24">
            <header className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-nb-ink bg-nb-mint px-3 py-1 font-brico font-bold text-sm shadow-nb-sm">
                    <ShieldCheck size={15} /> Legal
                </span>
                <h1 className="mt-5 font-brico font-extrabold tracking-[-0.04em] leading-[0.95] text-[clamp(2.8rem,7vw,5.5rem)]">{title}</h1>
                <p className="mt-5 text-lg text-nb-muted leading-relaxed">{intro}</p>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-nb-muted">Last updated: {updated}</p>
            </header>

            <div className="mt-14 grid lg:grid-cols-[260px_1fr] gap-10">
                <aside className="hidden lg:block">
                    <nav aria-label="On this page" className="sticky top-28 rounded-[22px] border-2 border-nb-ink bg-nb-lilac shadow-nb p-5">
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-ink/70 mb-3">On this page</p>
                        <ol className="space-y-2 text-sm">
                            {sections.map((s, i) => (
                                <li key={s.id}>
                                    <a href={`#${s.id}`} className="font-medium hover:underline underline-offset-4">
                                        {i + 1}. {s.title}
                                    </a>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-5 pt-4 border-t-2 border-nb-ink/20 space-y-1.5 text-sm">
                            {legalLinks
                                .filter((l) => l.href !== path)
                                .map((l) => (
                                    <Link key={l.href} href={l.href} className="block font-brico font-bold hover:text-nb-violet">
                                        {l.label} →
                                    </Link>
                                ))}
                        </div>
                    </nav>
                </aside>

                <article className="legal-prose space-y-6">
                    {sections.map((s, i) => (
                        <section key={s.id} id={s.id} className="scroll-mt-28 rounded-[22px] border-2 border-nb-ink bg-white shadow-nb p-6 sm:p-8">
                            <h2 className="font-brico font-extrabold text-xl sm:text-2xl tracking-tight">
                                <span className="inline-flex items-center justify-center w-9 h-9 mr-3 rounded-lg border-2 border-nb-ink bg-nb-sun text-base align-middle">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                {s.title}
                            </h2>
                            <div className="mt-4 text-nb-ink/80 leading-relaxed space-y-3">{s.body}</div>
                        </section>
                    ))}
                </article>
            </div>
        </div>
    );
}
