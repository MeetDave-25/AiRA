import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        const { data, error } = await db
            .from("TeamMemberProfile")
            .select("*")
            .order("sortOrder", { ascending: true })
            .order("createdAt", { ascending: true });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
        const isPresident = body.isPresident === true || body.isPresident === "true";

        if (isPresident) {
            await db.from("TeamMemberProfile").update({ isPresident: false }).eq("isPresident", true);
        }

        const { data, error } = await db
            .from("TeamMemberProfile")
            .insert({
                ...body,
                id: uuidv4(),
                sortOrder: body.sortOrder ? Number(body.sortOrder) : 0,
                isPresident,
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create team member", details: String(error) }, { status: 500 });
    }
}
