import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

        const topics = await prisma.blogTopic.findMany({
            where: includeAll ? {} : { isActive: true },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(topics);
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
        const existing = await prisma.blogTopic.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: "insensitive",
                },
            },
        });

        if (existing) {
            if (!existing.isActive) {
                // Reactivate existing inactive topic
                const reactivated = await prisma.blogTopic.update({
                    where: { id: existing.id },
                    data: { isActive: true, description: description || existing.description },
                });
                return NextResponse.json(reactivated, { status: 200 });
            }
            return NextResponse.json({ error: "A topic with this title already exists" }, { status: 409 });
        }

        const topic = await prisma.blogTopic.create({
            data: {
                title,
                description,
                isActive: true,
            },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

        return NextResponse.json(topic, { status: 201 });
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

        const topic = await prisma.blogTopic.update({
            where: { id },
            data: dataToUpdate,
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

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
        const postCount = await prisma.blogPost.count({
            where: { topicId: id },
        });

        if (postCount > 0) {
            // Deactivate instead of hard deleting to preserve post references
            await prisma.blogTopic.update({
                where: { id },
                data: { isActive: false },
            });
            return NextResponse.json({ ok: true, message: "Topic has posts and was deactivated" });
        }

        await prisma.blogTopic.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true, message: "Topic deleted successfully" });
    } catch (e: any) {
        console.error("Error deleting blog topic:", e);
        return NextResponse.json({ error: e.message || "Failed to delete topic" }, { status: 500 });
    }
}
