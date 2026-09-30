import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

// Rebuild the sitemap at most once an hour so new events/posts get discovered quickly.
export const revalidate = 3600;

const staticRoutes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/about", priority: 0.9, changeFrequency: "monthly" },
    { path: "/events", priority: 0.9, changeFrequency: "daily" },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.8, changeFrequency: "daily" },
    { path: "/magazine", priority: 0.7, changeFrequency: "weekly" },
    { path: "/achievements", priority: 0.7, changeFrequency: "monthly" },
    { path: "/leadership", priority: 0.7, changeFrequency: "monthly" },
    { path: "/join", priority: 0.8, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
];

type Row = { id: string; updatedAt: string };

async function rows(table: string, publishedOnly: boolean): Promise<Row[]> {
    try {
        let q = db.from(table).select("id, updatedAt");
        if (publishedOnly) q = q.eq("status", "PUBLISHED");
        const { data } = await q;
        return (data as Row[]) ?? [];
    } catch {
        // Never fail the sitemap because the database is unreachable at build time.
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const [events, projects, posts, magazines] = await Promise.all([
        rows("Event", false),
        rows("Project", true),
        rows("BlogPost", true),
        rows("Magazine", true),
    ]);

    const dynamic = (base: string, list: Row[], priority: number) =>
        list.map((r) => ({
            url: `${SITE_URL}${base}/${r.id}`,
            lastModified: new Date(r.updatedAt),
            changeFrequency: "weekly" as const,
            priority,
        }));

    return [
        ...staticRoutes.map((r) => ({
            url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
            lastModified: now,
            changeFrequency: r.changeFrequency,
            priority: r.priority,
        })),
        ...dynamic("/events", events, 0.7),
        ...dynamic("/projects", projects, 0.7),
        ...dynamic("/blog", posts, 0.6),
        ...dynamic("/magazine", magazines, 0.6),
    ];
}
