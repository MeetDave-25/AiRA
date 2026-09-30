import type { Metadata } from "next";
import { db } from "@/lib/db";
import { siteConfig, toMetaDescription } from "@/lib/site";

const DEFAULT_OG_IMAGE = "/opengraph-image";

export function pageMetadata({
    title,
    description,
    path,
    image,
    type = "website",
    noIndex = false,
}: {
    title: string;
    description: string;
    path: string;
    image?: string | null;
    type?: "website" | "article";
    noIndex?: boolean;
}): Metadata {
    // Fall back to the generated brand card (app/opengraph-image.tsx) so every page has a share image.
    const images = [{ url: image || DEFAULT_OG_IMAGE, alt: title }];
    return {
        // Re-declare the template so nested routes (e.g. /events/[id]) keep the "| AiRA Lab" suffix.
        title: { default: title, template: `%s | ${siteConfig.name}` },
        description,
        alternates: { canonical: path },
        openGraph: { title, description, url: path, type, siteName: siteConfig.name, locale: siteConfig.locale, images },
        twitter: { card: "summary_large_image", title, description, images },
        ...(noIndex && { robots: { index: false, follow: true } }),
    };
}

/** Fetch one row for metadata; returns null on any error so a page never 500s because of SEO. */
export async function fetchRow<T = Record<string, any>>(table: string, id: string, columns: string): Promise<T | null> {
    try {
        const { data } = await db.from(table).select(columns).eq("id", id).maybeSingle();
        return (data as T) ?? null;
    } catch {
        return null;
    }
}

export { toMetaDescription };
