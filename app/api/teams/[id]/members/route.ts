import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireLeadOrAdmin } from "@/lib/admin-guard";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireLeadOrAdmin(params.id);
    if (auth.error) return auth.error;

    try {
        const { data: memberships, error } = await db
            .from("TeamMembership")
            .select("*, User(id, name, email, role, avatar)")
            .eq("teamId", params.id);

        if (error) throw error;
        return NextResponse.json(memberships || []);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireLeadOrAdmin(params.id);
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
        const { name, email, role } = body;

        const normalizedName = String(name || "").trim();
        if (!normalizedName) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        let loginId = String(email || "").trim().toLowerCase();
        if (!loginId) {
            const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") || "member";
            loginId = `${slug}@airalabs.local`;
            let counter = 1;
            while (true) {
                const { data } = await db.from("User").select("id").eq("email", loginId).maybeSingle();
                if (!data) break;
                loginId = `${slug}.${counter}@airalabs.local`;
                counter++;
            }
        }

        const rawPassword = generatePassword(12);
        const hashed = await bcrypt.hash(rawPassword, 12);

        // Upsert user
        const { data: existingUser } = await db.from("User").select("*").eq("email", loginId).maybeSingle();

        let user: any;
        if (!existingUser) {
            const { data, error } = await db
                .from("User")
                .insert({
                    id: uuidv4(),
                    name: normalizedName,
                    email: loginId,
                    password: hashed,
                    role: role || "TEAM_MEMBER",
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single();
            if (error) throw error;
            user = data;
        } else {
            const { data, error } = await db
                .from("User")
                .update({ name: normalizedName, password: hashed, role: role || existingUser.role })
                .eq("email", loginId)
                .select()
                .single();
            if (error) throw error;
            user = data;
        }

        let membership: any;
        const { data: existingMem } = await db
            .from("TeamMembership")
            .select("*")
            .eq("userId", user.id)
            .eq("teamId", params.id)
            .maybeSingle();

        if (existingMem) {
            membership = existingMem;
        } else {
            const { data: newMem, error: memErr } = await db
                .from("TeamMembership")
                .insert({ id: uuidv4(), userId: user.id, teamId: params.id })
                .select()
                .single();
            if (memErr) throw memErr;
            membership = newMem;
        }

        return NextResponse.json({
            membership,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            generatedLoginId: loginId,
            generatedPassword: rawPassword,
        }, { status: 201 });
    } catch (error) {
        console.error("Add member error:", error);
        return NextResponse.json({ error: "Failed to add member", details: String(error) }, { status: 500 });
    }
}
