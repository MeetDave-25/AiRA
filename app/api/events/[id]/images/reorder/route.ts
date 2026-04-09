import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const orderedIds: string[] = Array.isArray(body?.orderedIds) ? body.orderedIds : [];

        if (!orderedIds.length) {
            return NextResponse.json({ error: "orderedIds is required" }, { status: 400 });
        }

        const { data: current } = await db
            .from("EventImage").select("id").eq("eventId", params.id);

        const currentIds = new Set((current || []).map((img: any) => img.id));
        const isSameSet = orderedIds.length === currentIds.size && orderedIds.every((id) => currentIds.has(id));

        if (!isSameSet) {
            return NextResponse.json({ error: "orderedIds does not match event images" }, { status: 400 });
        }

        const baseTime = Date.now() - orderedIds.length * 1000;
        await Promise.all(
            orderedIds.map((id, index) =>
                db.from("EventImage").update({ createdAt: new Date(baseTime + index * 1000).toISOString() }).eq("id", id)
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to reorder images" }, { status: 500 });
    }
}
