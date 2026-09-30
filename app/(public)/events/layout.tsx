import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: "Events & Workshops",
    description:
        "Upcoming and past AiRA Lab events: hackathons, AI & robotics workshops, tech talks and competitions for students at LJCCA, Ahmedabad.",
    path: "/events",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
