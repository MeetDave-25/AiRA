import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function DELETE(req: NextRequest, { params }: { params: { id: string; userId: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await db.from("TeamMembership").delete().eq("teamId", params.id).eq("userId", params.userId);
    return NextResponse.json({ success: true });
}
