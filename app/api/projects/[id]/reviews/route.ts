import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        const body = await req.json();

        const comment = (body.comment || "").trim();
        const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
        const authorName = (body.authorName || session?.user?.name || "Community Member").trim();
        const authorEmail = (body.authorEmail || session?.user?.email || null);

        if (!comment) {
            return NextResponse.json({ error: "Review comment is required" }, { status: 400 });
        }

        const newReview = {
            id: uuidv4(),
            projectId: params.id,
            authorName,
            authorEmail,
            rating,
            comment,
            createdAt: new Date().toISOString(),
        };

        const { data, error } = await db
            .from("ProjectReview")
            .insert(newReview)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("Create project review error:", error);
        return NextResponse.json({ error: error?.message || "Failed to submit review" }, { status: 500 });
    }
}
