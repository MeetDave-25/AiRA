import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;
        const { searchParams } = new URL(req.url);
        const take = Number(searchParams.get("take") || 30);
        const teamId = searchParams.get("teamId");

        const prismaAny: any = prisma;

        let where: any = {};

        // Admins can see all updates
        if (role === "ADMIN") {
            if (teamId) {
                where = {
                    task: { teamId },
                };
            }
        } else {
            // Team members see updates from their team's tasks only
            const memberships = await prisma.teamMembership.findMany({
                where: { userId },
                select: { teamId: true },
            });

            const userTeamIds = memberships.map((m) => m.teamId);

            where = {
                task: {
                    teamId: teamId ? teamId : { in: userTeamIds },
                },
            };
        }

        const updates = await prismaAny.taskUpdate.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: Math.min(Math.max(take, 1), 100),
            include: {
                author: { select: { id: true, name: true, email: true, role: true } },
                task: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        teamId: true,
                        team: { select: { id: true, name: true, color: true } },
                    },
                },
            },
        });

        return NextResponse.json(updates);
    } catch (error) {
        console.error("GET /api/task-updates error:", error);
        return NextResponse.json({
            error: "Failed to fetch updates",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { taskId, message } = body;

        if (!taskId || !message) {
            return NextResponse.json({ error: "Missing taskId or message" }, { status: 400 });
        }

        // Special case for announcements (taskId === "ANNOUNCEMENT")
        if (taskId === "ANNOUNCEMENT") {
            const prismaAny: any = prisma;
            const update = await prismaAny.taskUpdate.create({
                data: {
                    taskId: null,
                    message,
                    authorId: userId,
                },
                include: {
                    author: { select: { id: true, name: true, email: true } },
                },
            });
            return NextResponse.json(update, { status: 201 });
        }

        // For regular task updates, verify user has access to the task's team
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { team: true },
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // Check if user is part of the task's team or is admin
        const role = (session.user as any).role;
        if (role !== "ADMIN") {
            const membership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId,
                        teamId: task.teamId,
                    },
                },
            });

            if (!membership) {
                return NextResponse.json({ error: "Access denied to this team" }, { status: 403 });
            }
        }

        const prismaAny: any = prisma;
        const update = await prismaAny.taskUpdate.create({
            data: {
                taskId,
                message,
                authorId: userId,
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
                task: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        team: { select: { id: true, name: true, color: true } },
                    },
                },
            },
        });

        return NextResponse.json(update, { status: 201 });
    } catch (error) {
        console.error("POST /api/task-updates error:", error);
        return NextResponse.json({
            error: "Failed to create update",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
