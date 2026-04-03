import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const applications = await prisma.application.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(applications);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const app = await prisma.application.create({ data: body });
    return NextResponse.json(app, { status: 201 });
}
