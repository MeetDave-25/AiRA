import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, createdAt, updatedAt, ...updateData } = body;
    const { data, error } = await db.from("Application").update(updateData).eq("id", params.id).select().single();
    if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await db.from("Application").delete().eq("id", params.id);
    return NextResponse.json({ success: true });
}
