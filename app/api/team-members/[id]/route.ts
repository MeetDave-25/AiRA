import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import {
    deleteTeamMemberProfileOffline,
    isDbOfflineError,
    updateTeamMemberProfileOffline,
} from "@/lib/offline-admin-store";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
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
    } catch (error) {
        if (isDbOfflineError(error)) {
            const member = await updateTeamMemberProfileOffline(params.id, body);
            if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
            return NextResponse.json(member);
        }
        return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        await prisma.teamMemberProfile.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        if (isDbOfflineError(error)) {
            await deleteTeamMemberProfileOffline(params.id);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
    }
}
