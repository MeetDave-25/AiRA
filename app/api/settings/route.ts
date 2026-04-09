import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET() {
    const { data: settings } = await db.from("LabSetting").select("key, value");
    const result: Record<string, string> = {};
    (settings || []).forEach((s: any) => (result[s.key] = s.value));
    return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const entries = Object.entries(body);

    const updates = await Promise.all(
        entries.map(([key, value]) =>
            db.from("LabSetting")
                .upsert({ key, value: value as string }, { onConflict: "key" })
                .select()
                .single()
                .then(({ data }) => data)
        )
    );

    return NextResponse.json(updates);
}
