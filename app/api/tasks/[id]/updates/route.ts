import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function canAccessTask(taskId: string, userId: string, role: string) {
    if (role === "ADMIN") return true;

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { teamId: true, assignedTo: true },
    });

    if (!task) return false;
    if (task.assignedTo === userId) return true;

    const membership = await prisma.teamMembership.findFirst({
        where: { userId, teamId: task.teamId },
        select: { id: true },
    });

    return Boolean(membership);
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const prismaAny: any = prisma;
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const userId = session.user.id;

    const allowed = await canAccessTask(params.id, userId, role);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = await prismaAny.taskUpdate.findMany({
        where: { taskId: params.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
            author: { select: { id: true, name: true, email: true, role: true } },
        },
    });

    return NextResponse.json(updates);
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const prismaAny: any = prisma;
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const userId = session.user.id;

    const allowed = await canAccessTask(params.id, userId, role);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const message = String(body?.message || "").trim();

    if (!message) {
        return NextResponse.json({ error: "Update message is required" }, { status: 400 });
    }

    const update = await prismaAny.taskUpdate.create({
        data: {
            taskId: params.id,
            authorId: userId,
            message,
        },
        include: {
            author: { select: { id: true, name: true, email: true, role: true } },
        },
    });

    return NextResponse.json(update, { status: 201 });
}
