import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const AUTHORIZED_ROLES = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "TEAM_LEAD", "LEAD", "PRESIDENT", "VICE_PRESIDENT"];

// ── GET: Single post with author + reviews ──────────────────────────────────
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { data: post, error } = await db
            .from("BlogPost")
            .select(`
                *,
                author:User(id, name, avatar, role),
                topic:BlogTopic(id, title),
                reviews:BlogReview(*, author:User(id, name, avatar))
            `)
            .eq("id", params.id)
            .maybeSingle();

        if (error || !post) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (post.status !== "PUBLISHED") {
            const session = await getServerSession(authOptions);
            if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (e: any) {
        console.error("Error fetching single post:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ── PATCH: Author edits draft / Admin changes status ────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { data: post } = await db
            .from("BlogPost")
            .select("authorId, status")
            .eq("id", params.id)
            .maybeSingle();

        if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const userRole = (session.user.role || "").toUpperCase();
        const isAdmin = AUTHORIZED_ROLES.includes(userRole);
        const isAuthor = post.authorId === session.user.id;

        if (!isAdmin && !isAuthor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const dataToUpdate: any = {
            updatedAt: new Date().toISOString(),
        };

        if (body.title !== undefined) dataToUpdate.title = body.title.trim();
        if (body.content !== undefined) dataToUpdate.content = body.content.trim();
        if (body.coverImage !== undefined) dataToUpdate.coverImage = body.coverImage || null;
        if (body.tags !== undefined) dataToUpdate.tags = Array.isArray(body.tags) ? body.tags : [];
        if (isAdmin && body.status !== undefined) {
            dataToUpdate.status = body.status;
            dataToUpdate.publishedAt = body.status === "PUBLISHED" ? new Date().toISOString() : null;
        }
        if (isAuthor && body.submit) {
            dataToUpdate.status = "DRAFT";
        }

        const { data: updated, error } = await db
            .from("BlogPost")
            .update(dataToUpdate)
            .eq("id", params.id)
            .select(`
                *,
                author:User(id, name, avatar, role),
                topic:BlogTopic(id, title)
            `)
            .single();

        if (error) throw error;

        return NextResponse.json(updated);
    } catch (e: any) {
        console.error("Error updating blog post:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ── DELETE: Admin / Moderator only ──────────────────────────────────────────
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const userRole = (session.user.role || "").toUpperCase();
        if (!AUTHORIZED_ROLES.includes(userRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { error } = await db
            .from("BlogPost")
            .delete()
            .eq("id", params.id);

        if (error) throw error;

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("Error deleting blog post:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
