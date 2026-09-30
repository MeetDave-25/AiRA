import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — fetch current logged-in user's own projects (all statuses)
export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json([], { status: 200 });
        }

        // Try by authorId first, then fallback to authorName
        const { data, error } = await db
            .from("Project")
            .select("id, title, tagline, coverImage, status, featured, likes, createdAt, category, tags")
            .or(`authorId.eq.${session.user.id},authorName.eq.${session.user.name}`)
            .order("createdAt", { ascending: false });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error("Fetch my projects error:", error);
        return NextResponse.json([], { status: 200 });
    }
}
