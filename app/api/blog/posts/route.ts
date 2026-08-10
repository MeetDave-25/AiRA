import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

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

        let query = db
            .from("BlogPost")
            .select(`
                *,
                author:User(id, name, avatar, role),
                topic:BlogTopic(id, title),
                reviews:BlogReview(id)
            `)
            .eq("status", "PUBLISHED");

        if (topic) {
            query = query.eq("topicId", topic);
        }
        if (tag) {
            query = query.contains("tags", [tag]);
        }

        const { data: posts, error } = await query.order("publishedAt", { ascending: false });

        if (error) throw error;

        const formatted = (posts || []).map((p: any) => ({
            ...p,
            _count: {
                reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
            },
        }));

        return NextResponse.json(formatted);
    } catch (e: any) {
        console.error("Error fetching blog posts:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ── POST: Member creates a new draft ────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { topicId, title, content, coverImage, tags } = await req.json().catch(() => ({}));
        if (!topicId || !title?.trim() || !content?.trim()) {
            return NextResponse.json({ error: "topicId, title and content are required" }, { status: 400 });
        }

        const newPostId = uuidv4();
        const { data: post, error } = await db
            .from("BlogPost")
            .insert({
                id: newPostId,
                topicId,
                authorId: session.user.id,
                title:   title.trim(),
                content: content.trim(),
                coverImage: coverImage ?? null,
                tags:    Array.isArray(tags) ? tags : [],
                readTime: calcReadTime(content),
                status: "DRAFT",
                updatedAt: new Date().toISOString(),
            })
            .select(`
                *,
                author:User(id, name, avatar, role),
                topic:BlogTopic(id, title)
            `)
            .single();

        if (error) throw error;

        return NextResponse.json(post, { status: 201 });
    } catch (e: any) {
        console.error("Error creating blog post:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
