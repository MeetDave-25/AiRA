import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Admins may change any project; the project's owner may edit or delete their own. */
async function authorise(projectId: string) {
    const session: any = await getServerSession(authOptions as any);
    const user = session?.user;
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    const isAdmin = user.role === "ADMIN";
    if (isAdmin) return { isAdmin, user, currentStatus: null as string | null };
    const { data: project } = await db.from("Project").select("authorId, status").eq("id", projectId).maybeSingle();
    if (!project) return { error: NextResponse.json({ error: "Project not found" }, { status: 404 }) };
    if (!project.authorId || project.authorId !== user.id) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { isAdmin, user, currentStatus: (project.status as string) || null };
}

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
    const auth = await authorise(params.id);
    if (auth.error) return auth.error;
    try {
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
        // Featuring is admin-only.
        if (auth.isAdmin && body.featured !== undefined) updateData.featured = Boolean(body.featured);
        // Status: admins can set anything; owners can publish or unpublish their own project,
        // but cannot override an admin's rejection.
        if (body.status && ["PENDING", "PUBLISHED", "REJECTED"].includes(body.status)) {
            if (auth.isAdmin) {
                updateData.status = body.status;
            } else if (body.status !== "REJECTED") {
                if (auth.currentStatus === "REJECTED") {
                    return NextResponse.json({ error: "This project was rejected by an admin. Please contact the AiRA Lab team." }, { status: 403 });
                }
                updateData.status = body.status;
            }
        }


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
    const auth = await authorise(params.id);
    if (auth.error) return auth.error;
    try {
        const { error } = await db.from("Project").delete().eq("id", params.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
