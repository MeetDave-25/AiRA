import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── Estimate read time ──────────────────────────────────────────────────────
function calcReadTime(content: string): string {
    const words = content.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
}

// ── GET: All published posts (public) ───────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tag   = searchParams.get("tag");
        const topic = searchParams.get("topic");

        const posts = await prisma.blogPost.findMany({
            where: {
                status: "PUBLISHED",
                ...(tag   ? { tags:  { has: tag }  } : {}),
                ...(topic ? { topicId: topic }       : {}),
            },
            include: {
                author: { select: { id: true, name: true, avatar: true, role: true } },
                topic:  { select: { id: true, title: true } },
                _count: { select: { reviews: true } },
            },
            orderBy: { publishedAt: "desc" },
        });
        return NextResponse.json(posts);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ── POST: Member creates a new draft ────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { topicId, title, content, coverImage, tags } = await req.json();
        if (!topicId || !title?.trim() || !content?.trim()) {
            return NextResponse.json({ error: "topicId, title and content are required" }, { status: 400 });
        }

        const post = await prisma.blogPost.create({
            data: {
                topicId,
                authorId: session.user.id,
                title:   title.trim(),
                content: content.trim(),
                coverImage: coverImage ?? null,
                tags:    Array.isArray(tags) ? tags : [],
                readTime: calcReadTime(content),
                status: "DRAFT",
            },
        });
        return NextResponse.json(post, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
