import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const MAX_PASSWORD_CHANGES = 3;

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

        // Fetch user from DB (including passwordChanges counter)
        const { data: dbUser, error: userError } = await db
            .from("User")
            .select("id, email, password, name, passwordChanges")
            .eq("email", userEmail)
            .maybeSingle();

        if (userError || !dbUser) {
            return NextResponse.json({ error: "User account not found in database." }, { status: 404 });
        }

        const changesUsed: number = dbUser.passwordChanges ?? 0;

        // Enforce limit BEFORE verifying current password (fail fast)
        if (changesUsed >= MAX_PASSWORD_CHANGES) {
            return NextResponse.json(
                {
                    error: "Password change limit reached. You have used all 3 allowed password changes. Please contact an admin to reset your password.",
                    locked: true,
                    passwordChanges: changesUsed,
                    remaining: 0,
                },
                { status: 403 }
            );
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
        const newCount = changesUsed + 1;

        // Update password + increment counter atomically
        const { error: updateError } = await db
            .from("User")
            .update({
                password: hashed,
                passwordChanges: newCount,
                updatedAt: new Date().toISOString(),
            })
            .eq("id", dbUser.id);

        if (updateError) {
            throw updateError;
        }

        const remaining = MAX_PASSWORD_CHANGES - newCount;

        // Create an in-app security notification
        try {
            const notifMessage =
                remaining === 0
                    ? "Your AiRA Lab account password was successfully updated. This was your last allowed self-service password change."
                    : `Your AiRA Lab account password was successfully updated. You have ${remaining} password change${remaining === 1 ? "" : "s"} remaining.`;

            await db.from("Notification").insert({
                id: uuidv4(),
                userId: dbUser.id,
                title: "🔐 Security Alert: Password Changed",
                message: notifMessage,
                link: "/portal/settings",
                read: false,
                createdAt: new Date().toISOString(),
            });
        } catch {}

        return NextResponse.json({
            success: true,
            message: "Password has been successfully changed! Use your new password for future logins.",
            passwordChanges: newCount,
            remaining,
            locked: remaining === 0,
        });
    } catch (error: any) {
        console.error("Change password error:", error);
        return NextResponse.json(
            { error: "Failed to change password. Please try again later.", details: String(error) },
            { status: 500 }
        );
    }
}
