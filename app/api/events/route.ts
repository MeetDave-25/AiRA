import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        const userId = session?.user?.id;
        const role = (session?.user as any)?.role;
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get("teamId");

        let query = db
            .from("Event")
            .select("*, EventImage(*), EventAssignment(*, Team(*))")
            .order("date", { ascending: false });

        if (teamId) {
            // Filter events that have an assignment for this team
            query = db
                .from("Event")
                .select("*, EventImage(*), EventAssignment!inner(*, Team(*))")
                .eq("EventAssignment.teamId", teamId)
                .order("date", { ascending: false });
        } else if (userId && role !== "ADMIN") {
            // Team member — only show events for their teams
            const { data: memberships } = await db
                .from("TeamMembership")
                .select("teamId")
                .eq("userId", userId);

            const teamIds = (memberships || []).map((m: any) => m.teamId);

            if (teamIds.length > 0) {
                query = db
                    .from("Event")
                    .select("*, EventImage(*), EventAssignment!inner(*, Team(*))")
                    .in("EventAssignment.teamId", teamIds)
                    .order("date", { ascending: false });
            }
        }

        const { data: events, error } = await query;
        if (error) throw error;

        return NextResponse.json(events || []);
    } catch (error) {
        console.error("GET /api/events error:", error);
        return NextResponse.json({ error: "Failed to fetch events", details: String(error) }, { status: 500 });
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

        const { data: event, error } = await db
            .from("Event")
            .insert({
                title,
                date: date ? new Date(date).toISOString() : new Date().toISOString(),
                venue,
                mentor: mentor || null,
                coMentor: coMentor || null,
                coInstructors: Array.isArray(coInstructors) ? coInstructors : [],
                supportingTeam: Array.isArray(supportingTeam) ? supportingTeam : [],
                participantCount: participantCount ? Number(participantCount) : 0,
                organizedBy: organizedBy || null,
                leadBy: leadBy || null,
                objective: objective || null,
                description: description || null,
                outcome: outcome || null,
                isUpcoming: isUpcoming === true || isUpcoming === "true",
            })
            .select()
            .single();

        if (error) throw error;

        // Create team assignments
        if (Array.isArray(teamIds) && teamIds.length > 0) {
            await db.from("EventAssignment").insert(
                teamIds.map((tid: string) => ({ eventId: event.id, teamId: tid }))
            );
        }

        // Return event with relations
        const { data: full } = await db
            .from("Event")
            .select("*, EventImage(*), EventAssignment(*, Team(*))")
            .eq("id", event.id)
            .single();

        return NextResponse.json(full, { status: 201 });
    } catch (error) {
        console.error("POST /api/events error:", error);
        return NextResponse.json({ error: "Failed to create event", details: String(error) }, { status: 500 });
    }
}
