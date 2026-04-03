import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const prismaAny: any = prisma;
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const take = Number(searchParams.get("take") || 30);

    const updates = await prismaAny.taskUpdate.findMany({
        orderBy: { createdAt: "desc" },
        take: Math.min(Math.max(take, 1), 100),
        include: {
            author: { select: { id: true, name: true, email: true, role: true } },
            task: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    team: { select: { id: true, name: true, color: true } },
                },
            },
        },
    });

    return NextResponse.json(updates);
}
