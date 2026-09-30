import { Bot, Cpu, Layers3, ShieldCheck, type LucideIcon } from "lucide-react";

export type Frontier = { id: string; title: string; line: string; tags: string[]; icon: LucideIcon; color: string };

export const FRONTIERS: Frontier[] = [
    {
        id: "software",
        title: "Software & Platforms",
        line: "Web apps, tools and platforms people actually use — including the site you're scrolling right now.",
        tags: ["Next.js", "TypeScript", "Cloud"],
        icon: Layers3,
        color: "bg-nb-sky",
    },
    {
        id: "ai",
        title: "AI & Machine Learning",
        line: "Vision pipelines, language models and agents — trained, tested and shipped by students.",
        tags: ["PyTorch", "LLMs", "Computer Vision"],
        icon: Cpu,
        color: "bg-nb-peach",
    },
    {
        id: "robotics",
        title: "Robotics & Hardware",
        line: "Rovers that map a room, arms that pick and place, and the electronics that make them move.",
        tags: ["ROS2", "Arduino", "LiDAR"],
        icon: Bot,
        color: "bg-nb-mint",
    },
    {
        id: "cyber",
        title: "Cyber & IoT",
        line: "Firmware, radios and the protocols between them — built to be audited and trusted.",
        tags: ["ESP32", "MQTT", "Security"],
        icon: ShieldCheck,
        color: "bg-nb-lilac",
    },
];

export const STATIONS = [
    { year: "2023", name: "The spark", title: "AiRA Lab is born", desc: "A handful of student technologists and mentors set out to bridge the classroom and frontier engineering." },
    { year: "2024", name: "First machines", title: "Rovers & hackathon wins", desc: "Our first custom rover prototype, and regional hackathon wins powered by real-time computer vision." },
    { year: "2025", name: "Community", title: "40+ members, 4 wings", desc: "Tech, Robotics, Management and Cyber wings — and workshops for 500+ participants." },
    { year: "2026", name: "Next era", title: "Mevy & the magazine", desc: "Our AI guide, the AiRA Magazine, and research projects built for production." },
];

export const TEAMS = ["Tech", "Robotics", "Management", "Cyber"];
