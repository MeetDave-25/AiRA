import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: "Achievements",
    description:
        "Awards, hackathon wins, publications and milestones earned by AiRA Lab students and teams.",
    path: "/achievements",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
