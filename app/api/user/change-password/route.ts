import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Both current password and new password are required." },
                { status: 400 }
            );
        }

        if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
            return NextResponse.json(
                { error: "New password must be at least 6 characters long." },
                { status: 400 }
            );
        }

        const userEmail = session.user.email.toLowerCase().trim();

        // Fetch user from DB
        const { data: dbUser, error: userError } = await db
            .from("User")
            .select("id, email, password, name")
            .eq("email", userEmail)
            .maybeSingle();

        if (userError || !dbUser) {
            return NextResponse.json({ error: "User account not found in database." }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: "Incorrect current password. Please try again." },
                { status: 400 }
            );
        }

        // Hash new password
        const hashed = await bcrypt.hash(newPassword.trim(), 12);

        // Update password in DB
        const { error: updateError } = await db
            .from("User")
            .update({
                password: hashed,
                updatedAt: new Date().toISOString(),
            })
            .eq("id", dbUser.id);

        if (updateError) {
            throw updateError;
        }

        // Create an in-app security notification
        try {
            await db.from("Notification").insert({
                id: uuidv4(),
                userId: dbUser.id,
                title: "🔐 Security Alert: Password Changed",
                message: "Your AiRA Lab account password was successfully updated just now.",
                link: "/portal/settings",
                read: false,
                createdAt: new Date().toISOString(),
            });
        } catch {}

        return NextResponse.json({
            success: true,
            message: "Password has been successfully changed! Use your new password for future logins.",
        });
    } catch (error: any) {
        console.error("Change password error:", error);
        return NextResponse.json(
            { error: "Failed to change password. Please try again later.", details: String(error) },
            { status: 500 }
        );
    }
}
