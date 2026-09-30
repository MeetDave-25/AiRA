import type { Metadata } from "next";
import { fetchRow, pageMetadata, toMetaDescription } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type MagazineRow = { title: string; edition: string; description?: string | null; coverImage?: string | null; status: string };

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const mag = await fetchRow<MagazineRow>("Magazine", params.id, "title, edition, description, coverImage, status");
    if (!mag || mag.status !== "PUBLISHED") {
        return pageMetadata({ title: "Magazine", description: siteConfig.description, path: `/magazine/${params.id}`, noIndex: true });
    }
    return pageMetadata({
        title: `${mag.title} (${mag.edition})`,
        description: toMetaDescription(mag.description || `${mag.title} — ${mag.edition} of the AiRA Lab magazine.`),
        path: `/magazine/${params.id}`,
        image: mag.coverImage,
        type: "article",
    });
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
