import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
    const achievements = await prisma.achievement.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(achievements);
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const ach = await prisma.achievement.create({
        data: { ...body, date: body.date ? new Date(body.date) : undefined },
    });
    return NextResponse.json(ach, { status: 201 });
}
