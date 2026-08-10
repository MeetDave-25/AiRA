import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const AUTHORIZED_ROLES = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "TEAM_LEAD", "LEAD", "PRESIDENT", "VICE_PRESIDENT"];

function isManagementRole(role?: string): boolean {
    if (!role) return false;
    return AUTHORIZED_ROLES.includes(role.toUpperCase().trim());
}

// ── GET: Fetch blog topics ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeAll = searchParams.get("all") === "true";

        let query = db
            .from("BlogTopic")
            .select("*, posts:BlogPost(id)");

        if (!includeAll) {
            query = query.eq("isActive", true);
        }

        const { data: topics, error } = await query.order("createdAt", { ascending: false });

        if (error) throw error;

        // Map count of posts
        const formatted = (topics || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            isActive: t.isActive,
            createdAt: t.createdAt,
            _count: {
                posts: Array.isArray(t.posts) ? t.posts.length : 0,
            },
        }));

        return NextResponse.json(formatted);
    } catch (e: any) {
        console.error("Error fetching blog topics:", e);
        return NextResponse.json({ error: e.message || "Failed to load topics" }, { status: 500 });
    }
}

// ── POST: Create a new blog topic ───────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Please log in to create a topic" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const title = (body.title || "").trim();
        const description = (body.description || "").trim() || null;

        if (!title) {
            return NextResponse.json({ error: "Topic title is required" }, { status: 400 });
        }

        if (title.length < 2) {
            return NextResponse.json({ error: "Topic title must be at least 2 characters" }, { status: 400 });
        }

        // Check if topic already exists (case-insensitive)
        const { data: existingList } = await db
            .from("BlogTopic")
            .select("*")
            .ilike("title", title)
            .limit(1);

        const existing = existingList?.[0];

        if (existing) {
            if (!existing.isActive) {
                // Reactivate existing inactive topic
                const { data: reactivated, error: reactError } = await db
                    .from("BlogTopic")
                    .update({ isActive: true, description: description || existing.description })
                    .eq("id", existing.id)
                    .select()
                    .single();

                if (reactError) throw reactError;
                return NextResponse.json(reactivated, { status: 200 });
            }
            return NextResponse.json({ error: "A topic with this title already exists" }, { status: 409 });
        }

        const newTopicId = uuidv4();
        const { data: topic, error: insertError } = await db
            .from("BlogTopic")
            .insert({
                id: newTopicId,
                title,
                description,
                isActive: true,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({
            ...topic,
            _count: { posts: 0 },
        }, { status: 201 });
    } catch (e: any) {
        console.error("Error creating blog topic:", e);
        return NextResponse.json({ error: e.message || "Failed to create topic" }, { status: 500 });
    }
}

// ── PATCH: Update / Toggle topic ────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = session.user.role || "";
        if (!isManagementRole(role)) {
            return NextResponse.json({ error: "Permission denied" }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const { id, title, description, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
        }

        const dataToUpdate: any = {};
        if (title !== undefined && title.trim()) dataToUpdate.title = title.trim();
        if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;
        if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

        const { data: topic, error: updateError } = await db
            .from("BlogTopic")
            .update(dataToUpdate)
            .eq("id", id)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json(topic);
    } catch (e: any) {
        console.error("Error updating blog topic:", e);
        return NextResponse.json({ error: e.message || "Failed to update topic" }, { status: 500 });
    }
}

// ── DELETE: Delete topic ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = session.user.role || "";
        if (!isManagementRole(role)) {
            return NextResponse.json({ error: "Permission denied" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        let id = searchParams.get("id");

        if (!id) {
            const body = await req.json().catch(() => ({}));
            id = body.id;
        }

        if (!id) {
            return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
        }

        // Check if there are posts attached
        const { count, error: countError } = await db
            .from("BlogPost")
            .select("*", { count: "exact", head: true })
            .eq("topicId", id);

        if (count && count > 0) {
            // Deactivate instead of hard deleting to preserve post references
            await db
                .from("BlogTopic")
                .update({ isActive: false })
                .eq("id", id);
            return NextResponse.json({ ok: true, message: "Topic has posts and was deactivated" });
        }

        const { error: deleteError } = await db
            .from("BlogTopic")
            .delete()
            .eq("id", id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ ok: true, message: "Topic deleted successfully" });
    } catch (e: any) {
        console.error("Error deleting blog topic:", e);
        return NextResponse.json({ error: e.message || "Failed to delete topic" }, { status: 500 });
    }
}
