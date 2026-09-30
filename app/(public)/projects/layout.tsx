import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: "Student Projects",
    description:
        "Explore AI, robotics, web and research projects built by AiRA Lab students — with live demos, source code and community reviews.",
    path: "/projects",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
