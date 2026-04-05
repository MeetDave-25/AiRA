import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;
        const updateId = params.id;

        const prismaAny: any = prisma;
        const update = await prismaAny.taskUpdate.findUnique({
            where: { id: updateId },
            include: { author: true },
        });

        if (!update) {
            return NextResponse.json({ error: "Update not found" }, { status: 404 });
        }

        // Only author or admin can delete
        if (update.authorId !== userId && role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prismaAny.taskUpdate.delete({
            where: { id: updateId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/task-updates/[id] error:", error);
        return NextResponse.json({
            error: "Failed to delete update",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
