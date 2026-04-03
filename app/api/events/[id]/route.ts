import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: params.id },
            include: {
                images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
                assignments: { include: { team: true } },
            },
        });
        if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const event = await prisma.event.update({
            where: { id: params.id },
            data: {
                ...body,
                date: body.date ? new Date(body.date) : undefined,
                coInstructors: body.coInstructors || [],
                supportingTeam: body.supportingTeam || [],
            },
        });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        await prisma.event.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
