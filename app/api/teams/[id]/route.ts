import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, createdAt, updatedAt, ...updateData } = body;
    const team = await prisma.team.update({
        where: { id: params.id },
        data: updateData
    });
    return NextResponse.json(team);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await prisma.team.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
