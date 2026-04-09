import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { data: event, error } = await db
            .from("Event")
            .select("*, EventImage(*), EventAssignment(*, Team(*))")
            .eq("id", params.id)
            .order("isPrimary", { ascending: false, referencedTable: "EventImage" })
            .single();

        if (error || !event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
        return NextResponse.json({
            ...event,
            images: event.EventImage || [],
            assignments: event.EventAssignment || []
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, createdAt, EventImage, EventAssignment, ...updateData } = body;

    try {
        const { data: event, error } = await db
            .from("Event")
            .update({
                ...updateData,
                date: updateData.date ? new Date(updateData.date).toISOString() : undefined,
                coInstructors: updateData.coInstructors || [],
                supportingTeam: updateData.supportingTeam || [],
            })
            .eq("id", params.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { error } = await db.from("Event").delete().eq("id", params.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
