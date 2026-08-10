import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { data: reviews, error } = await db
            .from("BlogReview")
            .select(`
                *,
                author:User(id, name, avatar)
            `)
            .eq("postId", params.id)
            .order("createdAt", { ascending: false });

        if (error) throw error;

        return NextResponse.json(reviews || []);
    } catch (e: any) {
        console.error("Error fetching blog reviews:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) return NextResponse.json({ error: "Please log in to review" }, { status: 401 });

        const { body, rating } = await req.json().catch(() => ({}));
        if (!body?.trim()) return NextResponse.json({ error: "Review text required" }, { status: 400 });

        const newReviewId = uuidv4();
        const { data: review, error } = await db
            .from("BlogReview")
            .insert({
                id: newReviewId,
                postId: params.id,
                authorId: session.user.id,
                body: body.trim(),
                rating: Math.min(5, Math.max(1, Number(rating) || 5)),
            })
            .select(`
                *,
                author:User(id, name, avatar)
            `)
            .single();

        if (error) {
            if (error.code === "23505") { // unique constraint
                return NextResponse.json({ error: "You already reviewed this post" }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json(review, { status: 201 });
    } catch (e: any) {
        console.error("Error creating blog review:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
