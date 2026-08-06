import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_PASSWORD_CHANGES = 3;

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase().trim();

    const { data: dbUser, error } = await db
        .from("User")
        .select("passwordChanges")
        .eq("email", userEmail)
        .maybeSingle();

    if (error || !dbUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const used: number = dbUser.passwordChanges ?? 0;
    const remaining = Math.max(0, MAX_PASSWORD_CHANGES - used);

    return NextResponse.json({
        passwordChanges: used,
        remaining,
        max: MAX_PASSWORD_CHANGES,
        locked: remaining === 0,
    });
}
