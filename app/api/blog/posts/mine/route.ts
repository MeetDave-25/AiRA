import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Member: fetch only their own posts (all statuses)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const posts = await prisma.blogPost.findMany({
            where: { authorId: session.user.id },
            include: {
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
