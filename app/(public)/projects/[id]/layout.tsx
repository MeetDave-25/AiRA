import type { Metadata } from "next";
import { fetchRow, pageMetadata, toMetaDescription } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

type ProjectRow = {
    title: string;
    tagline?: string | null;
    description: string;
    coverImage?: string | null;
    tags?: string[];
    authorName?: string | null;
    createdAt: string;
    githubUrl?: string | null;
};

async function getProject(id: string) {
    return fetchRow<ProjectRow>("Project", id, "title, tagline, description, coverImage, tags, authorName, createdAt, githubUrl");
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const project = await getProject(params.id);
    if (!project) return pageMetadata({ title: "Project", description: siteConfig.description, path: `/projects/${params.id}`, noIndex: true });
    return {
        ...pageMetadata({
            title: project.title,
            description: toMetaDescription(project.tagline || project.description),
            path: `/projects/${params.id}`,
            image: project.coverImage,
        }),
        keywords: project.tags,
    };
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
    const project = await getProject(params.id);
    const jsonLd = project && {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: toMetaDescription(project.tagline || project.description, 300),
        image: project.coverImage || undefined,
        dateCreated: project.createdAt,
        keywords: project.tags?.join(", "),
        creator: project.authorName
            ? { "@type": "Person", name: project.authorName }
            : { "@type": "Organization", name: siteConfig.name },
        sameAs: project.githubUrl || undefined,
        url: absoluteUrl(`/projects/${params.id}`),
    };
    return (
        <>
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
            {children}
        </>
    );
}
