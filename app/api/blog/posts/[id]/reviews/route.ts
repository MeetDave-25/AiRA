import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const reviews = await prisma.blogReview.findMany({
            where: { postId: params.id },
            include: { author: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(reviews);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Login to review" }, { status: 401 });

        const { body, rating } = await req.json();
        if (!body?.trim()) return NextResponse.json({ error: "Review text required" }, { status: 400 });

        const review = await prisma.blogReview.create({
            data: {
                postId:   params.id,
                authorId: session.user.id,
                body:     body.trim(),
                rating:   Math.min(5, Math.max(1, Number(rating) || 5)),
            },
            include: { author: { select: { id: true, name: true, avatar: true } } },
        });
        return NextResponse.json(review, { status: 201 });
    } catch (e: any) {
        if (e.code === "P2002") {
            return NextResponse.json({ error: "You already reviewed this post" }, { status: 409 });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
