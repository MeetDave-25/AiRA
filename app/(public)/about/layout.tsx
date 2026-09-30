import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: "About Us",
    description:
        "Meet AiRA Lab — the student-driven AI, robotics and research lab at L J College of Computer Application, Ahmedabad. Our mission, journey, milestones and the team building the future.",
    path: "/about",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
