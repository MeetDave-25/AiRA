// Central site configuration used for SEO metadata, sitemap, structured data and legal pages.

export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? "https://www.aira-lab.in" : process.env.NEXT_PUBLIC_APP_URL) ||
    "https://www.aira-lab.in"
).replace(/\/$/, "");

export const siteConfig = {
    name: "AiRA Lab",
    shortName: "AiRA Lab",
    title: "AiRA Lab — Student-led community building software, AI & robotics | LJCCA",
    description:
        "AiRA Lab is a student-led community at L J College of Computer Application, Ahmedabad, building software, AI and robotics. Explore student projects, tech events, workshops, blogs and the AiRA magazine.",
    keywords: [
        "AiRA Lab",
        "AIRA Labs",
        "student-led community",
        "student innovation lab",
        "student council",
        "AI lab Ahmedabad",
        "robotics club",
        "LJCCA",
        "L J College of Computer Application",
        "LJ University",
        "college tech club",
        "student projects",
        "hackathon",
        "tech events Ahmedabad",
    ],
    locale: "en_IN",
    email: "info@aira-lab.in",
    phone: "+91-81609-01481",
    address: {
        street: "L J College of Computer Application (LJCCA), Vastrapur",
        city: "Ahmedabad",
        region: "Gujarat",
        country: "IN",
    },
    social: {
        github: "https://github.com/MeetDave-25/AiRA",
        linkedin: "https://www.linkedin.com/company/aira-lab",
    },
    logo: "/logo.png",
    legalUpdated: "2026-09-27",
} as const;

export function absoluteUrl(path = "/") {
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Trim and strip markdown/HTML so free-form content can be used as a meta description. */
export function toMetaDescription(text?: string | null, max = 160) {
    if (!text) return siteConfig.description;
    const plain = text
        .replace(/<[^>]+>/g, " ")
        .replace(/[#*_>`~\[\]()!|-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (plain.length <= max) return plain || siteConfig.description;
    return plain.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}
