import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: "Leadership & Team",
    description:
        "Meet the founders, student council leaders, mentors and team members who run AiRA Lab at L J College of Computer Application.",
    path: "/leadership",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
