import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        const { data, error } = await db
            .from("TeamMemberProfile")
            .select("*")
            .order("sortOrder", { ascending: true })
            .order("createdAt", { ascending: true });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
        const name = (body.name || "").trim().slice(0, 150);
        const role = (body.role || "").trim().slice(0, 150);
        const bio = (body.bio || "").trim();
        const photo = (body.photo || "").trim();
        const linkedin = (body.linkedin || "").trim().slice(0, 255);
        const github = (body.github || "").trim().slice(0, 255);
        const teamGroup = (body.teamGroup || "").trim().slice(0, 150);

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Limit bio to 500 words or 3000 chars
        const wordCount = bio ? bio.split(/\s+/).length : 0;
        if (wordCount > 500 || bio.length > 3000) {
            return NextResponse.json({ 
                error: `Bio statement exceeds limit (max 500 words / 3,000 characters). Current: ${wordCount} words.` 
            }, { status: 400 });
        }

        const isPresident = body.isPresident === true || body.isPresident === "true";

        const { data, error } = await db
            .from("TeamMemberProfile")
            .insert({
                id: uuidv4(),
                name,
                role: role || (isPresident ? "Executive Lead" : "Member"),
                bio: bio || null,
                photo: photo || null,
                linkedin: linkedin || null,
                github: github || null,
                teamGroup: teamGroup || (isPresident ? "Founders & Executive Board" : "Core Team"),
                sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : 0,
                isPresident,
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create leader / team member", details: String(error) }, { status: 500 });
    }
}
