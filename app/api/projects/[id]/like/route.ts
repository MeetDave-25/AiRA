import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { data: project, error: getErr } = await db
            .from("Project")
            .select("likes")
            .eq("id", params.id)
            .single();

        if (getErr || !project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const newLikes = (project.likes || 0) + 1;
        const { data, error } = await db
            .from("Project")
            .update({ likes: newLikes })
            .eq("id", params.id)
            .select("likes")
            .single();

        if (error) throw error;

        return NextResponse.json({ likes: data.likes });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to like project" }, { status: 500 });
    }
}
