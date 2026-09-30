import type { Metadata } from "next";
import { fetchRow, pageMetadata, toMetaDescription } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

type PostRow = {
    title: string;
    content: string;
    coverImage?: string | null;
    tags?: string[];
    status: string;
    publishedAt?: string | null;
    updatedAt: string;
    author?: { name: string } | null;
};

async function getPost(id: string) {
    const post = await fetchRow<PostRow>("BlogPost", id, "title, content, coverImage, tags, status, publishedAt, updatedAt, author:User(name)");
    return post?.status === "PUBLISHED" ? post : null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const post = await getPost(params.id);
    if (!post) return pageMetadata({ title: "Blog", description: siteConfig.description, path: `/blog/${params.id}`, noIndex: true });
    return {
        ...pageMetadata({
            title: post.title,
            description: toMetaDescription(post.content),
            path: `/blog/${params.id}`,
            image: post.coverImage,
            type: "article",
        }),
        keywords: post.tags,
        authors: post.author ? [{ name: post.author.name }] : undefined,
    };
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
    const post = await getPost(params.id);
    const jsonLd = post && {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: toMetaDescription(post.content),
        image: post.coverImage ? [post.coverImage] : undefined,
        datePublished: post.publishedAt || post.updatedAt,
        dateModified: post.updatedAt,
        author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
        publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.logo) },
        },
        mainEntityOfPage: absoluteUrl(`/blog/${params.id}`),
        keywords: post.tags?.join(", "),
    };
    return (
        <>
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
            {children}
        </>
    );
}
