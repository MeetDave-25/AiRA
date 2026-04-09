import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        const { data: update, error: fetchErr } = await db
            .from("TaskUpdate").select("authorId").eq("id", params.id).single();

        if (fetchErr || !update) return NextResponse.json({ error: "Update not found" }, { status: 404 });

        if (update.authorId !== userId && role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await db.from("TaskUpdate").delete().eq("id", params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete update" }, { status: 500 });
    }
}
