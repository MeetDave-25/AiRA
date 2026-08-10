import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Member: fetch only their own posts (all statuses)
export async function GET() {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: posts, error } = await db
            .from("BlogPost")
            .select(`
                *,
                topic:BlogTopic(id, title),
                reviews:BlogReview(id)
            `)
            .eq("authorId", session.user.id)
            .order("createdAt", { ascending: false });

        if (error) throw error;

        const formatted = (posts || []).map((p: any) => ({
            ...p,
            _count: {
                reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
            },
        }));

        return NextResponse.json(formatted);
    } catch (e: any) {
        console.error("Error fetching user's posts:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
