import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { createEventOffline, isDbOfflineError, listEventsOffline } from "@/lib/offline-admin-store";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        const userId = session?.user?.id;
        const role = (session?.user as any)?.role;

        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get("teamId");

        let where: any = undefined;

        // If a specific team is requested or user is not admin, filter by team
        if (teamId || (userId && role !== "ADMIN")) {
            if (role === "ADMIN") {
                // Admin viewing specific team's events
                if (teamId) {
                    where = {
                        assignments: {
                            some: {
                                teamId,
                            },
                        },
                    };
                }
            } else {
                // Team member viewing only their team's events
                const memberships = await prisma.teamMembership.findMany({
                    where: { userId },
                    select: { teamId: true },
                });

                const userTeamIds = memberships.map((m) => m.teamId);

                if (teamId && !userTeamIds.includes(teamId)) {
                    return NextResponse.json({ error: "Access denied" }, { status: 403 });
                }

                if (userTeamIds.length > 0) {
                    where = {
                        assignments: {
                            some: {
                                teamId: teamId ? teamId : { in: userTeamIds },
                            },
                        },
                    };
                } else {
                    // Non-team user sees only public events (no team assignment)
                    where = {
                        assignments: {
                            none: {},
                        },
                    };
                }
            }
        }
        // Admin with no team filter sees all events

        const events = await prisma.event.findMany({
            where,
            include: {
                images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
                assignments: { include: { team: true } },
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(events);
    } catch (error) {
        if (isDbOfflineError(error)) {
            const events = await listEventsOffline();
            return NextResponse.json(events);
        }
        console.error("GET /api/events error:", error);
        return NextResponse.json({
            error: "Failed to fetch events",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
        const {
            title, date, venue, mentor, coMentor, coInstructors,
            supportingTeam, participantCount, organizedBy, leadBy,
            objective, description, outcome, isUpcoming, teamIds,
        } = body;

        const event = await prisma.event.create({
            data: {
                title,
                date: date ? new Date(date) : new Date(),
                venue,
                mentor,
                coMentor,
                coInstructors: Array.isArray(coInstructors) ? coInstructors : [],
                supportingTeam: Array.isArray(supportingTeam) ? supportingTeam : [],
                participantCount: participantCount ? Number(participantCount) : 0,
                organizedBy,
                leadBy,
                objective,
                description,
                outcome,
                isUpcoming: isUpcoming === true || isUpcoming === "true",
                assignments: Array.isArray(teamIds)
                    ? {
                        create: teamIds.map((teamId: string) => ({
                            teamId,
                        })),
                    }
                    : undefined,
            },
            include: {
                images: true,
                assignments: { include: { team: true } },
            },
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        if (isDbOfflineError(error)) {
            const event = await createEventOffline(body);
            return NextResponse.json(event, { status: 201 });
        }
        console.error("POST /api/events error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
