import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
    try {
        const { data, error } = await db
            .from("Achievement")
            .select("*")
            .order("date", { ascending: false });
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    try {
        const { data, error } = await db
            .from("Achievement")
            .insert({ ...body, date: body.date ? new Date(body.date).toISOString() : null })
            .select()
            .single();
        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
    }
}
