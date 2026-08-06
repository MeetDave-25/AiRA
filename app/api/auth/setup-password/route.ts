import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Verify token
        const { data: resetToken, error: tokenError } = await db
            .from("PasswordResetToken")
            .select("userId, expiresAt")
            .eq("token", token)
            .single();

        if (tokenError || !resetToken) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        if (new Date(resetToken.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Token has expired" }, { status: 400 });
        }

        // Update user password
        const hashedPassword = await bcrypt.hash(password, 12);

        const { error: updateError } = await db
            .from("User")
            .update({ password: hashedPassword })
            .eq("id", resetToken.userId);

        if (updateError) {
            return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
        }

        // Delete the used token
        await db
            .from("PasswordResetToken")
            .delete()
            .eq("token", token);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Setup Password API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
