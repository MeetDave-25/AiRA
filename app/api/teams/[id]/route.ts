import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { deleteTeamOffline, isDbOfflineError, updateTeamOffline } from "@/lib/offline-admin-store";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const updateData = { ...(body || {}) };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    try {
        const team = await prisma.team.update({
            where: { id: params.id },
            data: updateData
        });
        return NextResponse.json(team);
    } catch (error) {
        if (isDbOfflineError(error)) {
            const team = await updateTeamOffline(params.id, updateData);
            if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
            return NextResponse.json(team);
        }
        return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        await prisma.team.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        if (isDbOfflineError(error)) {
            await deleteTeamOffline(params.id);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
    }
}
