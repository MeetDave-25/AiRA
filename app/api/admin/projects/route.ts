import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET — fetch ALL projects for admin (any status)
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { data, error } = await db
            .from("Project")
            .select("*, reviews:ProjectReview(*)")
            .order("createdAt", { ascending: false });

        if (error) throw error;

        const projects = (data || []).map((p: any) => {
            const reviews = p.reviews || [];
            const avgRating = reviews.length > 0
                ? Number((reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1))
                : 5.0;
            return { ...p, avgRating, reviewCount: reviews.length };
        });

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error("Admin fetch projects error:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}
