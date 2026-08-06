import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// PATCH — admin: update registration status or notes
export async function PATCH(req: NextRequest, { params }: { params: { id: string, regId: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { regId } = params;
    const body = await req.json();

    const { data: updatedReg, error } = await db
        .from("EventRegistration")
        .update({
            status: body.status,
            notes: body.notes,
        })
        .eq("id", regId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ registration: updatedReg });
}
