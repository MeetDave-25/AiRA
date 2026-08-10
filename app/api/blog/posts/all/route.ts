import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Admin: fetch all posts (with optional status filter)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const posts = await prisma.blogPost.findMany({
            where: status ? { status } : {},
            include: {
                author: { select: { id: true, name: true, avatar: true } },
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
