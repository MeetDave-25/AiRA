import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: "Magazine",
    description:
        "Read AiRA Chronicles — the official AiRA Lab magazine featuring the best student writing, research highlights and campus innovation stories.",
    path: "/magazine",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
