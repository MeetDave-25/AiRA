import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: "Join AiRA Lab",
    description:
        "Apply to join AiRA Lab — work on real AI and robotics projects, lead events, and grow with a community of student innovators.",
    path: "/join",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
