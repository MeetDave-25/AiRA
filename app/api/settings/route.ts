import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET() {
    const settings = await prisma.labSetting.findMany();
    const result: Record<string, string> = {};
    settings.forEach((s) => (result[s.key] = s.value));
    return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const updates = await Promise.all(
        Object.entries(body).map(([key, value]) =>
            prisma.labSetting.upsert({
                where: { key },
                update: { value: value as string },
                create: { key, value: value as string },
            })
        )
    );
    return NextResponse.json(updates);
}
