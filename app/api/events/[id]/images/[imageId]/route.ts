import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string; imageId: string } }
) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const { isPrimary } = body;

        if (isPrimary) {
            await prisma.eventImage.updateMany({
                where: { eventId: params.id },
                data: { isPrimary: false },
            });
        }

        const image = await prisma.eventImage.update({
            where: { id: params.imageId },
            data: { isPrimary: Boolean(isPrimary) },
        });

        return NextResponse.json(image);
    } catch (error) {
        console.error("PUT /api/events/[id]/images/[imageId] error:", error);
        return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; imageId: string } }
) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const image = await prisma.eventImage.findUnique({ where: { id: params.imageId } });
        if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

        await prisma.eventImage.delete({ where: { id: params.imageId } });

        // Ensure there is still a primary image when possible.
        if (image.isPrimary) {
            const fallback = await prisma.eventImage.findFirst({
                where: { eventId: params.id },
                orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
            });

            if (fallback) {
                await prisma.eventImage.update({
                    where: { id: fallback.id },
                    data: { isPrimary: true },
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/events/[id]/images/[imageId] error:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}
