import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        const userId = (session.user as any).id;
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get("teamId");

        let where: any = undefined;

        if (role === "ADMIN") {
            where = teamId ? { teamId } : undefined;
        } else {
            const memberships = await prisma.teamMembership.findMany({
                where: { userId },
                select: { teamId: true },
            });

            const teamIds = memberships.map((m) => m.teamId);

            where = {
                AND: [
                    ...(teamId ? [{ teamId }] : []),
                    {
                        OR: [
                            { assignedTo: userId },
                            ...(teamIds.length ? [{ teamId: { in: teamIds } }] : []),
                        ],
                    },
                ],
            };
        }

        const tasks = await prisma.task.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { team: { select: { id: true, name: true, color: true } } },
        });

        const assignedUserIds = Array.from(
            new Set(tasks.map((task) => task.assignedTo).filter(Boolean) as string[])
        );

        const users = assignedUserIds.length
            ? await prisma.user.findMany({
                where: { id: { in: assignedUserIds } },
                select: { id: true, name: true, email: true },
            })
            : [];

        const usersById = new Map(users.map((u) => [u.id, u]));

        const enriched = tasks.map((task) => ({
            ...task,
            assignedUser: task.assignedTo ? usersById.get(task.assignedTo) || null : null,
            isAssignedToMe: task.assignedTo === userId,
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        return NextResponse.json({
            error: "Failed to fetch tasks",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { title, description, status, dueDate, teamId, assignedTo } = body;
    const task = await prisma.task.create({
        data: {
            title, description,
            status: status || "TODO",
            dueDate: dueDate ? new Date(dueDate) : undefined,
            teamId, assignedTo,
        },
    });
    return NextResponse.json(task, { status: 201 });
}
