import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch recent notifications to aggregate broadcast history
        const { data, error } = await db
            .from("Notification")
            .select("id, title, message, link, createdAt, userId")
            .order("createdAt", { ascending: false })
            .limit(200);

        if (error) throw error;

        // Group notifications by title and timestamp (within 2-second windows) to present unified broadcast items
        const broadcastMap = new Map<string, any>();
        for (const item of data || []) {
            const timeKey = `${item.title}_${item.createdAt.slice(0, 16)}`;
            if (!broadcastMap.has(timeKey)) {
                broadcastMap.set(timeKey, {
                    id: item.id,
                    title: item.title,
                    message: item.message,
                    link: item.link,
                    createdAt: item.createdAt,
                    recipientsCount: 1,
                    ids: [item.id],
                });
            } else {
                const existing = broadcastMap.get(timeKey);
                existing.recipientsCount += 1;
                existing.ids.push(item.id);
            }
        }

        const broadcasts = Array.from(broadcastMap.values()).slice(0, 30);
        return NextResponse.json(broadcasts);
    } catch (error) {
        console.error("Fetch broadcasts error:", error);
        return NextResponse.json([]);
    }
}

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
            const { error: insertError } = await db
                .from("Notification")
                .insert(notificationRecords);

            if (insertError) {
                console.error("Batch insert error:", insertError);
                throw insertError;
            }
        }

        // Emit instant broadcast across Supabase Realtime channel
        try {
            const channel = db.channel("aira_global_broadcasts");
            await channel.send({
                type: "broadcast",
                event: "notification",
                payload: {
                    id: uuidv4(),
                    title: formattedTitle,
                    message: message.trim(),
                    link: link?.trim() || null,
                    targetAudience,
                    createdAt: now,
                }
            });
        } catch (rtErr) {
            console.warn("Supabase realtime broadcast send warning:", rtErr);
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

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role || "TEAM_MEMBER";
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER") {
        return NextResponse.json({ error: "Forbidden: insufficient permissions to delete broadcast" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const title = searchParams.get("title");
        const id = searchParams.get("id");
        const clearAll = searchParams.get("clearAll") === "true";

        if (clearAll) {
            await db.from("Notification").delete().neq("id", "none");
            return NextResponse.json({ success: true, message: "All notifications cleared" });
        }

        if (title) {
            await db.from("Notification").delete().eq("title", title);
            return NextResponse.json({ success: true, message: "Broadcast notifications deleted" });
        }

        if (id) {
            await db.from("Notification").delete().eq("id", id);
            return NextResponse.json({ success: true, message: "Notification deleted" });
        }

        return NextResponse.json({ error: "Provide title, id, or clearAll=true" }, { status: 400 });
    } catch (error) {
        console.error("Delete broadcast error:", error);
        return NextResponse.json({ error: "Failed to delete broadcast" }, { status: 500 });
    }
}
