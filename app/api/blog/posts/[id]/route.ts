import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── GET: Single post with author + reviews ──────────────────────────────────
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { id: params.id },
            include: {
                author: { select: { id: true, name: true, avatar: true, role: true } },
                topic:  { select: { id: true, title: true } },
                reviews: {
                    include: { author: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (post.status !== "PUBLISHED") {
            const session = await getServerSession(authOptions);
            if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ── PATCH: Author edits draft / Admin changes status ────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
        if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const isAdmin  = session.user.role === "ADMIN";
        const isAuthor = post.authorId === session.user.id;
        if (!isAdmin && !isAuthor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const updated = await prisma.blogPost.update({
            where: { id: params.id },
            data: {
                ...(body.title      !== undefined ? { title: body.title }           : {}),
                ...(body.content    !== undefined ? { content: body.content }       : {}),
                ...(body.coverImage !== undefined ? { coverImage: body.coverImage } : {}),
                ...(body.tags       !== undefined ? { tags: body.tags }             : {}),
                ...(isAdmin && body.status !== undefined ? {
                    status:      body.status,
                    publishedAt: body.status === "PUBLISHED" ? new Date() : null,
                } : {}),
                // Member submitting for review
                ...(isAuthor && body.submit ? { status: "DRAFT" } : {}),
            },
        });
        return NextResponse.json(updated);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ── DELETE: Admin only ───────────────────────────────────────────────────────
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        await prisma.blogPost.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
