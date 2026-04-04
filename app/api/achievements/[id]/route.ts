import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, ...updateData } = body;
    const ach = await prisma.achievement.update({
        where: { id: params.id },
        data: {
            ...updateData,
            date: updateData.date ? new Date(updateData.date) : undefined
        },
    });
    return NextResponse.json(ach);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await prisma.achievement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
