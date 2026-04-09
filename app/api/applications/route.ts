import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { data } = await db.from("Application").select("*").order("createdAt", { ascending: false });
    return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, phone, interest, message } = body;
        const { data, error } = await db
            .from("Application")
            .insert({
                id: uuidv4(),
                name,
                email,
                phone: phone || null,
                interest: interest || null,
                message: message || null,
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();
        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
    }
}
