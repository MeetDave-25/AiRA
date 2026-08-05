import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role || "TEAM_MEMBER";
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER" && role !== "TEAM_LEAD") {
        return NextResponse.json({ error: "Forbidden: insufficient permissions to broadcast" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, message, link, targetAudience = "ALL", teamId, category = "ANNOUNCEMENT" } = body;

        if (!title?.trim() || !message?.trim()) {
            return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
        }

        // Determine recipient user IDs
        let recipientUserIds: string[] = [];

        if (targetAudience === "TEAM" && teamId) {
            const { data: members } = await db
                .from("TeamMembership")
                .select("userId")
                .eq("teamId", teamId);
            if (members) {
                recipientUserIds = members.map((m: any) => m.userId);
            }
        } else if (targetAudience === "ALL") {
            const { data: allUsers } = await db
                .from("User")
                .select("id");
            if (allUsers) {
                recipientUserIds = allUsers.map((u: any) => u.id);
            }
        } else {
            // Target by role
            const { data: filteredUsers } = await db
                .from("User")
                .select("id")
                .eq("role", targetAudience);
            if (filteredUsers) {
                recipientUserIds = filteredUsers.map((u: any) => u.id);
            }
        }

        // Prefix emojis or icons based on category for rich social app look
        let formattedTitle = title.trim();
        if (category === "EVENT" && !formattedTitle.startsWith("📅")) {
            formattedTitle = `📅 ${formattedTitle}`;
        } else if (category === "ACHIEVEMENT" && !formattedTitle.startsWith("🏆")) {
            formattedTitle = `🏆 ${formattedTitle}`;
        } else if (category === "ALERT" && !formattedTitle.startsWith("⚡")) {
            formattedTitle = `⚡ ${formattedTitle}`;
        } else if (category === "TASK" && !formattedTitle.startsWith("🚀")) {
            formattedTitle = `🚀 ${formattedTitle}`;
        } else if (category === "ANNOUNCEMENT" && !formattedTitle.startsWith("📢")) {
            formattedTitle = `📢 ${formattedTitle}`;
        }

        const now = new Date().toISOString();
        const notificationRecords = recipientUserIds.map((uid) => ({
            id: uuidv4(),
            userId: uid,
            title: formattedTitle,
            message: message.trim(),
            link: link?.trim() || null,
            read: false,
            createdAt: now,
        }));

        if (notificationRecords.length > 0) {
            // Batch insert notifications
            const { error: insertError } = await db
                .from("Notification")
                .insert(notificationRecords);

            if (insertError) {
                console.error("Batch insert error:", insertError);
                throw insertError;
            }
        }

        return NextResponse.json({
            success: true,
            recipientCount: recipientUserIds.length,
            title: formattedTitle,
            message: message.trim(),
            link: link?.trim() || null,
            createdAt: now,
        });
    } catch (error) {
        console.error("Broadcast notification error:", error);
        return NextResponse.json({ error: "Failed to broadcast notification", details: String(error) }, { status: 500 });
    }
}
