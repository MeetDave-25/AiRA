import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const topics = await prisma.blogTopic.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(topics);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const { title, description } = await req.json();
        if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

        const topic = await prisma.blogTopic.create({
            data: { title: title.trim(), description: description?.trim() ?? null },
        });
        return NextResponse.json(topic, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const { id, title, description, isActive } = await req.json();
        const topic = await prisma.blogTopic.update({
            where: { id },
            data: { title, description, isActive },
        });
        return NextResponse.json(topic);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
