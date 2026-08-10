import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const AUTHORIZED_ROLES = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "TEAM_LEAD", "LEAD", "PRESIDENT"];

// ── GET: list all editions (published → public, all → admin) ────────────────
export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        const userRole = (session?.user?.role || "").toUpperCase();
        const isAdmin = AUTHORIZED_ROLES.includes(userRole);

        let query = db
            .from("Magazine")
            .select(`
                *,
                posts:MagazinePost(
                    id, sortOrder, postId,
                    post:BlogPost(
                        id, title, coverImage, readTime,
                        author:User(name, avatar)
                    )
                )
            `);

        if (!isAdmin) {
            query = query.eq("status", "PUBLISHED");
        }

        const { data: magazines, error } = await query.order("createdAt", { ascending: false });

        if (error) throw error;

        return NextResponse.json(magazines || []);
    } catch (e: any) {
        console.error("Error fetching magazines:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ── POST: Admin creates new magazine ────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user.role || "").toUpperCase();
        if (!AUTHORIZED_ROLES.includes(userRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { title, edition, description, coverImage } = await req.json().catch(() => ({}));
        if (!title?.trim() || !edition?.trim()) {
            return NextResponse.json({ error: "title and edition required" }, { status: 400 });
        }

        const newId = uuidv4();
        const { data: magazine, error } = await db
            .from("Magazine")
            .insert({
                id: newId,
                title: title.trim(),
                edition: edition.trim(),
                description: description ? description.trim() : null,
                coverImage: coverImage || null,
                status: "DRAFT",
                updatedAt: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(magazine, { status: 201 });
    } catch (e: any) {
        console.error("Error creating magazine:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
