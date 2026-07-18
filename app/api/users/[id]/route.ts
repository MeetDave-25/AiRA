import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
        const { name, email, role, password } = body;

        const updatePayload: Record<string, any> = {
            updatedAt: new Date().toISOString(),
        };

        if (name && String(name).trim()) updatePayload.name = String(name).trim();
        if (email && String(email).trim()) updatePayload.email = String(email).trim().toLowerCase();
        if (role) updatePayload.role = role;
        if (password && String(password).trim()) {
            updatePayload.password = await bcrypt.hash(String(password).trim(), 12);
        }

        const { data: user, error } = await db
            .from("User")
            .update(updatePayload)
            .eq("id", params.id)
            .select("id, name, email, role, createdAt")
            .single();

        if (error) throw error;
        return NextResponse.json(user);
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Failed to update user", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { error } = await db.from("User").delete().eq("id", params.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Failed to delete user", details: String(error) }, { status: 500 });
    }
}
