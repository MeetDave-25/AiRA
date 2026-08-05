import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

const INITIAL_PROFILES = [
    {
        name: "Meet Dave",
        role: "Founder & Lead Architect",
        bio: "Pioneering intelligent robotics architectures, generative AI integration, and autonomous control systems. Leading AiRA Lab's core vision and technological frontiers.",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        teamGroup: "Founders & Executive Board",
        sortOrder: 1,
        isPresident: true,
    },
    {
        name: "Aarav Sharma",
        role: "Co-Founder & AI Research Director",
        bio: "Specializing in deep reinforcement learning, neural scene representations, and edge AI deployment on embedded autonomous systems.",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        teamGroup: "Founders & Executive Board",
        sortOrder: 2,
        isPresident: true,
    },
    {
        name: "Dr. Rajesh Patel",
        role: "Chief Faculty Mentor & Dean of Research",
        bio: "Advising lab initiatives, peer-reviewed publications, and strategic industry collaborations across robotics and automation domains.",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
        linkedin: "https://linkedin.com",
        teamGroup: "Advisors & Mentors",
        sortOrder: 3,
        isPresident: false,
    },
    {
        name: "Priya Nair",
        role: "Lead Systems & Hardware Engineer",
        bio: "Directing PCB design, micro-actuation systems, sensor fusion arrays, and real-time embedded communication pipelines.",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        teamGroup: "Domain & Tech Leads",
        sortOrder: 4,
        isPresident: false,
    },
    {
        name: "Rohan Varma",
        role: "Autonomous Navigation Researcher",
        bio: "Developing SLAM algorithms, LiDAR point cloud segmentation, and path-planning modules for mobile ground rovers.",
        photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
        teamGroup: "Robotics Division",
        sortOrder: 5,
        isPresident: false,
    },
    {
        name: "Ananya Iyer",
        role: "Full-Stack & Cloud Systems Engineer",
        bio: "Architecting real-time telemetry pipelines, microservices, and interactive web dashboards for lab platforms.",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
        teamGroup: "AI & Software Division",
        sortOrder: 6,
        isPresident: false,
    }
];

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const rows = INITIAL_PROFILES.map((p) => ({
            ...p,
            id: uuidv4(),
            updatedAt: new Date().toISOString(),
        }));

        const { data, error } = await db
            .from("TeamMemberProfile")
            .insert(rows)
            .select();

        if (error) throw error;
        return NextResponse.json({ success: true, count: data?.length || rows.length });
    } catch (error) {
        return NextResponse.json({ error: "Failed to seed profiles", details: String(error) }, { status: 500 });
    }
}
