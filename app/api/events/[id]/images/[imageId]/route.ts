import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string; imageId: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const { isPrimary } = body;

        if (isPrimary) {
            await db.from("EventImage").update({ isPrimary: false }).eq("eventId", params.id);
        }

        const { data: image, error } = await db
            .from("EventImage")
            .update({ isPrimary: Boolean(isPrimary) })
            .eq("id", params.imageId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(image);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; imageId: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { data: image, error: fetchErr } = await db
            .from("EventImage").select("*").eq("id", params.imageId).single();

        if (fetchErr || !image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

        await db.from("EventImage").delete().eq("id", params.imageId);

        if (image.isPrimary) {
            const { data: fallback } = await db
                .from("EventImage")
                .select("id")
                .eq("eventId", params.id)
                .order("createdAt", { ascending: true })
                .limit(1)
                .single();

            if (fallback) {
                await db.from("EventImage").update({ isPrimary: true }).eq("id", fallback.id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}
