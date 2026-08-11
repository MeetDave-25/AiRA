import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { data: project, error } = await db
            .from("Project")
            .select("*, reviews:ProjectReview(*)")
            .eq("id", params.id)
            .single();

        if (error || !project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const reviews = (project.reviews || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const avgRating = reviews.length > 0
            ? Number((reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1))
            : 5.0;

        return NextResponse.json({
            ...project,
            reviews,
            avgRating,
            reviewCount: reviews.length,
        });
    } catch (error: any) {
        console.error("Fetch project error:", error);
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        const body = await req.json();

        const updateData: Record<string, any> = {
            updatedAt: new Date().toISOString(),
        };

        if (body.title) updateData.title = body.title.trim();
        if (body.tagline !== undefined) updateData.tagline = body.tagline?.trim() || null;
        if (body.description) updateData.description = body.description.trim();
        if (body.category) updateData.category = body.category.trim();
        if (body.coverImage !== undefined) updateData.coverImage = body.coverImage || null;
        if (body.demoUrl !== undefined) updateData.demoUrl = body.demoUrl || null;
        if (body.githubUrl !== undefined) updateData.githubUrl = body.githubUrl || null;
        if (body.tags) updateData.tags = Array.isArray(body.tags) ? body.tags : body.tags.split(",").map((t: string) => t.trim());
        if (body.featured !== undefined) updateData.featured = Boolean(body.featured);

        const { data, error } = await db
            .from("Project")
            .update(updateData)
            .eq("id", params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Update project error:", error);
        return NextResponse.json({ error: error?.message || "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        const { error } = await db.from("Project").delete().eq("id", params.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
