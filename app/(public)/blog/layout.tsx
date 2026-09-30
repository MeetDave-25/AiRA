import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: "Blog",
    description:
        "Articles, tutorials and research notes written by AiRA Lab students on AI, machine learning, robotics, web development and emerging tech.",
    path: "/blog",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
