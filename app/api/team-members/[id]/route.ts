import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const isPresident = body.isPresident === true || body.isPresident === "true";

    if (isPresident) {
        await prisma.teamMemberProfile.updateMany({
            where: { isPresident: true },
            data: { isPresident: false },
        });
    }

    const member = await prisma.teamMemberProfile.update({
        where: { id: params.id },
        data: {
            ...body,
            sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
            isPresident,
        },
    });

    return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await prisma.teamMemberProfile.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
