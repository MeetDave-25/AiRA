import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, ...updateData } = body;
    try {
        const { data, error } = await db
            .from("Achievement")
            .update({ ...updateData, date: updateData.date ? new Date(updateData.date).toISOString() : null })
            .eq("id", params.id)
            .select()
            .single();
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update achievement" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await db.from("Achievement").delete().eq("id", params.id);
    return NextResponse.json({ success: true });
}
