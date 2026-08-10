import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const AUTHORIZED_ROLES = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "TEAM_LEAD", "LEAD", "PRESIDENT", "VICE_PRESIDENT"];

// Admin / Content Manager / Lead: fetch all posts (with optional status filter)
export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user.role || "").toUpperCase();
        if (!AUTHORIZED_ROLES.includes(role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const posts = await prisma.blogPost.findMany({
            where: status ? { status } : {},
            include: {
                author: { select: { id: true, name: true, avatar: true, role: true } },
                topic:  { select: { id: true, title: true } },
                _count: { select: { reviews: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(posts);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
