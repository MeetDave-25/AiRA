import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const orderedIds: string[] = Array.isArray(body?.orderedIds) ? body.orderedIds : [];

        if (!orderedIds.length) {
            return NextResponse.json({ error: "orderedIds is required" }, { status: 400 });
        }

        const current = await prisma.eventImage.findMany({
            where: { eventId: params.id },
            select: { id: true },
        });

        const currentIds = new Set(current.map((img) => img.id));
        const isSameSet = orderedIds.length === currentIds.size && orderedIds.every((id) => currentIds.has(id));

        if (!isSameSet) {
            return NextResponse.json({ error: "orderedIds does not match event images" }, { status: 400 });
        }

        const baseTime = Date.now() - orderedIds.length * 1000;

        await prisma.$transaction(
            orderedIds.map((id, index) =>
                prisma.eventImage.update({
                    where: { id },
                    data: { createdAt: new Date(baseTime + index * 1000) },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT /api/events/[id]/images/reorder error:", error);
        return NextResponse.json({ error: "Failed to reorder images" }, { status: 500 });
    }
}
