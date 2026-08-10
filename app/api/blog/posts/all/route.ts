import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

        let query = db
            .from("BlogPost")
            .select(`
                *,
                author:User(id, name, avatar, role),
                topic:BlogTopic(id, title),
                reviews:BlogReview(id)
            `);

        if (status) {
            query = query.eq("status", status);
        }

        const { data: posts, error } = await query.order("createdAt", { ascending: false });

        if (error) throw error;

        const formatted = (posts || []).map((p: any) => ({
            ...p,
            _count: {
                reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
            },
        }));

        return NextResponse.json(formatted);
    } catch (e: any) {
        console.error("Error fetching all blog posts:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
