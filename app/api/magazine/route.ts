import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── GET: list all editions (published → public, all → admin) ────────────────
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "ADMIN";

        const magazines = await prisma.magazine.findMany({
            where: isAdmin ? {} : { status: "PUBLISHED" },
            include: {
                posts: {
                    include: {
                        post: {
                            include: {
                                author: { select: { name: true, avatar: true } },
                            },
                        },
                    },
                    orderBy: { sortOrder: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(magazines);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ── POST: Admin creates new magazine ────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const { title, edition, description, coverImage } = await req.json();
        if (!title?.trim() || !edition?.trim()) {
            return NextResponse.json({ error: "title and edition required" }, { status: 400 });
        }
        const magazine = await prisma.magazine.create({
            data: { title: title.trim(), edition: edition.trim(), description, coverImage },
        });
        return NextResponse.json(magazine, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
