import { pageMetadata } from "@/lib/seo";

// Same content as /leadership — point search engines at the canonical URL to avoid duplicate content.
export const metadata = {
    ...pageMetadata({
        title: "Leadership & Team",
        description: "Meet the founders, student council leaders, mentors and team members who run AiRA Lab.",
        path: "/leadership",
    }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
