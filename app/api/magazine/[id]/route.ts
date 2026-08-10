import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const magazine = await prisma.magazine.findUnique({
            where: { id: params.id },
            include: {
                posts: {
                    include: {
                        post: {
                            include: {
                                author: { select: { id: true, name: true, avatar: true, role: true } },
                                topic:  { select: { title: true } },
                                reviews: { select: { rating: true } },
                            },
                        },
                    },
                    orderBy: { sortOrder: "asc" },
                },
            },
        });
        if (!magazine) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (magazine.status !== "PUBLISHED") {
            const session = await getServerSession(authOptions);
            if (session?.user?.role !== "ADMIN") {
                return NextResponse.json({ error: "Not found" }, { status: 404 });
            }
        }
        return NextResponse.json(magazine);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const body = await req.json();

        // Handle curated post additions/removals
        if (body.addPostId) {
            const count = await prisma.magazinePost.count({ where: { magazineId: params.id } });
            await prisma.magazinePost.create({
                data: { magazineId: params.id, postId: body.addPostId, sortOrder: count },
            });
        }
        if (body.removePostId) {
            await prisma.magazinePost.deleteMany({
                where: { magazineId: params.id, postId: body.removePostId },
            });
        }

        const updated = await prisma.magazine.update({
            where: { id: params.id },
            data: {
                ...(body.title       ? { title: body.title }             : {}),
                ...(body.edition     ? { edition: body.edition }         : {}),
                ...(body.description !== undefined ? { description: body.description } : {}),
                ...(body.coverImage  !== undefined ? { coverImage: body.coverImage }  : {}),
                ...(body.status === "PUBLISHED" ? { status: "PUBLISHED", publishedAt: new Date() } : {}),
                ...(body.status === "DRAFT"     ? { status: "DRAFT", publishedAt: null }            : {}),
            },
            include: {
                posts: {
                    include: { post: { include: { author: { select: { name: true, avatar: true } } } } },
                    orderBy: { sortOrder: "asc" },
                },
            },
        });
        return NextResponse.json(updated);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        await prisma.magazine.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
