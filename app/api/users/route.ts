import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { data: users, error } = await db
            .from("User")
            .select("id, name, email, role, avatar, createdAt")
            .order("createdAt", { ascending: true });

        if (error) throw error;
        return NextResponse.json(users || []);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
        const { name, email, role, password: customPassword } = body;

        const normalizedName = String(name || "").trim();
        if (!normalizedName) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        let loginId = String(email || "").trim().toLowerCase();
        if (!loginId) {
            const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") || "member";
            loginId = `${slug}@airalab.local`;
            let counter = 1;
            while (true) {
                const { data } = await db.from("User").select("id").eq("email", loginId).maybeSingle();
                if (!data) break;
                loginId = `${slug}.${counter}@airalab.local`;
                counter++;
            }
        } else {
            // Check if email already exists
            const { data: existing } = await db.from("User").select("id").eq("email", loginId).maybeSingle();
            if (existing) {
                return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
            }
        }

        const rawPassword = (customPassword && String(customPassword).trim()) ? String(customPassword).trim() : generatePassword(10);
        const hashed = await bcrypt.hash(rawPassword, 12);

        const { data: user, error } = await db
            .from("User")
            .insert({
                id: uuidv4(),
                name: normalizedName,
                email: loginId,
                password: hashed,
                role: role || "TEAM_MEMBER",
                updatedAt: new Date().toISOString(),
            })
            .select("id, name, email, role, createdAt")
            .single();

        if (error) throw error;

        return NextResponse.json({
            user,
            generatedLoginId: loginId,
            generatedPassword: rawPassword,
        }, { status: 201 });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: "Failed to create user", details: String(error) }, { status: 500 });
    }
}
