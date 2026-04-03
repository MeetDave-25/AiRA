import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role === "ADMIN") {
        const task = await prisma.task.update({
            where: { id: params.id },
            data: { ...body, dueDate: body.dueDate ? new Date(body.dueDate) : undefined },
        });
        return NextResponse.json(task);
    }

    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const membership = await prisma.teamMembership.findFirst({
        where: { userId, teamId: existing.teamId },
        select: { id: true },
    });

    if (existing.assignedTo !== userId && !membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowedStatus = ["TODO", "IN_PROGRESS", "DONE"];
    if (!allowedStatus.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const task = await prisma.task.update({
        where: { id: params.id },
        data: { status: body.status },
    });

    return NextResponse.json(task);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
