import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
    try {
        const members = await Promise.race([
            prisma.teamMemberProfile.findMany({
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Team members query timeout")), 7000)
            ),
        ]);

        return NextResponse.json(members);
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const isPresident = body.isPresident === true || body.isPresident === "true";

        if (isPresident) {
            await prisma.teamMemberProfile.updateMany({
                where: { isPresident: true },
                data: { isPresident: false },
            });
        }

        const member = await prisma.teamMemberProfile.create({
            data: {
                ...body,
                sortOrder: body.sortOrder ? Number(body.sortOrder) : 0,
                isPresident,
            }
        });
        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error("POST /api/team-members error:", error);
        return NextResponse.json({
            error: "Failed to create team member",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
