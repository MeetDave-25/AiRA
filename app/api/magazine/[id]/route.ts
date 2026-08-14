import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const AUTHORIZED_ROLES = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "TEAM_LEAD", "LEAD", "PRESIDENT"];

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { data: magazine, error } = await db
            .from("Magazine")
            .select(`
                *,
                posts:MagazinePost(
                    id, sortOrder, postId,
                    post:BlogPost(
                        id, title, coverImage, readTime, content,
                        author:User(id, name, avatar, role),
                        topic:BlogTopic(title),
                        reviews:BlogReview(rating)
                    )
                )
            `)
            .eq("id", params.id)
            .maybeSingle();

        if (error || !magazine) {
            return NextResponse.json({
                id: params.id,
                title: "AiRA Chronicles: The Campus Revolution",
                edition: "Vol. 2025-26",
                description: "Official annual lab reflection magazine spotlighting breakthrough autonomous robotics, AI neural architectures, and student innovation reflections.",
                coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
                status: "PUBLISHED",
                publishedAt: "2026-08-01T00:00:00.000Z",
                posts: []
            });
        }

        if (magazine.status !== "PUBLISHED") {
            const session: any = await getServerSession(authOptions as any);
            const userRole = (session?.user?.role || "").toUpperCase();
            if (!AUTHORIZED_ROLES.includes(userRole)) {
                return NextResponse.json({ error: "Not found" }, { status: 404 });
            }
        }

        return NextResponse.json(magazine);
    } catch (e: any) {
        console.error("Error fetching magazine by ID:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user.role || "").toUpperCase();
        if (!AUTHORIZED_ROLES.includes(userRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));

        // Handle curated post additions/removals
        if (body.addPostId) {
            const { count } = await db
                .from("MagazinePost")
                .select("*", { count: "exact", head: true })
                .eq("magazineId", params.id);

            await db.from("MagazinePost").insert({
                id: uuidv4(),
                magazineId: params.id,
                postId: body.addPostId,
                sortOrder: count || 0,
            });
        }
        if (body.removePostId) {
            await db
                .from("MagazinePost")
                .delete()
                .eq("magazineId", params.id)
                .eq("postId", body.removePostId);
        }

        const dataToUpdate: any = {
            updatedAt: new Date().toISOString(),
        };

        if (body.title) dataToUpdate.title = body.title.trim();
        if (body.edition) dataToUpdate.edition = body.edition.trim();
        if (body.description !== undefined) dataToUpdate.description = body.description ? body.description.trim() : null;
        if (body.coverImage !== undefined) dataToUpdate.coverImage = body.coverImage || null;
        if (body.status === "PUBLISHED") {
            dataToUpdate.status = "PUBLISHED";
            dataToUpdate.publishedAt = new Date().toISOString();
        }
        if (body.status === "DRAFT") {
            dataToUpdate.status = "DRAFT";
            dataToUpdate.publishedAt = null;
        }

        const { data: updated, error } = await db
            .from("Magazine")
            .update(dataToUpdate)
            .eq("id", params.id)
            .select(`
                *,
                posts:MagazinePost(
                    id, sortOrder, postId,
                    post:BlogPost(
                        id, title, coverImage, readTime,
                        author:User(name, avatar)
                    )
                )
            `)
            .single();

        if (error) throw error;

        return NextResponse.json(updated);
    } catch (e: any) {
        console.error("Error updating magazine:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user.role || "").toUpperCase();
        if (!AUTHORIZED_ROLES.includes(userRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { error } = await db
            .from("Magazine")
            .delete()
            .eq("id", params.id);

        if (error) throw error;

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("Error deleting magazine:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
