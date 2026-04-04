import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
    try {
        const events = await prisma.event.findMany({
            include: {
                images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
                assignments: { include: { team: true } },
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(events);
    } catch (error) {
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

    try {
        const body = await req.json();
        const {
            title, date, venue, mentor, coMentor, coInstructors,
            supportingTeam, participantCount, organizedBy, leadBy,
            objective, description, outcome, isUpcoming,
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
            },
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error("POST /api/events error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
