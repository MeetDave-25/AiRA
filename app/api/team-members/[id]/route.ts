import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    try {
        const isPresident = body.isPresident === true || body.isPresident === "true";

        if (isPresident) {
            await db.from("TeamMemberProfile").update({ isPresident: false }).eq("isPresident", true);
        }

        const { id, createdAt, updatedAt, ...updateData } = body;
        const { data, error } = await db
            .from("TeamMemberProfile")
            .update({
                ...updateData,
                sortOrder: updateData.sortOrder !== undefined ? Number(updateData.sortOrder) : undefined,
                isPresident,
            })
            .eq("id", params.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await db.from("TeamMemberProfile").delete().eq("id", params.id);
    return NextResponse.json({ success: true });
}
