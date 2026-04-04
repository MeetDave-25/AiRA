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
    try {
        const body = await req.json();
        const { name, email, phone, interest, message } = body;
        const app = await prisma.application.create({
            data: { name, email, phone, interest, message }
        });
        return NextResponse.json(app, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
    }
}
