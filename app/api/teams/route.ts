import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const teams = await Promise.race([
            prisma.team.findMany({
                include: {
                    memberships: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
                    _count: { select: { assignments: true, tasks: true } },
                },
                orderBy: { createdAt: "asc" },
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Teams query timeout")), 7000)
            ),
        ]);

        return NextResponse.json(teams);
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const { name, description, color } = body;
        const team = await prisma.team.create({ data: { name, description, color: color || "#00D4FF" } });
        return NextResponse.json(team, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }
}
