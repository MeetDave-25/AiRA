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

    const userId = (session.user as any)?.id;
    const userEmail = session.user.email.toLowerCase();

    try {
        // Find DB user id if session id is virtual
        let targetUserId = userId;
        if (!targetUserId || targetUserId.startsWith("local-bypass-")) {
            const { data: dbUser } = await db
                .from("User")
                .select("id")
                .eq("email", userEmail)
                .maybeSingle();
            if (dbUser) {
                targetUserId = dbUser.id;
            }
        }

        let notifications: any[] = [];
        if (targetUserId) {
            const { data, error } = await db
                .from("Notification")
                .select("*")
                .eq("userId", targetUserId)
                .order("createdAt", { ascending: false })
                .limit(50);

            if (!error && data) {
                notifications = data;
            }
        }

        const unreadCount = notifications.filter((n) => !n.read).length;

        return NextResponse.json({
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        return NextResponse.json({ notifications: [], unreadCount: 0 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, markAll } = body;
        const userId = (session.user as any)?.id;

        if (markAll) {
            await db
                .from("Notification")
                .update({ read: true })
                .eq("userId", userId)
                .eq("read", false);
            return NextResponse.json({ success: true });
        }

        if (id) {
            await db
                .from("Notification")
                .update({ read: true })
                .eq("id", id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Missing id or markAll" }, { status: 400 });
    } catch (error) {
        console.error("Update notification error:", error);
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = (session.user as any)?.id;

    try {
        if (id) {
            await db.from("Notification").delete().eq("id", id);
        } else if (userId) {
            await db.from("Notification").delete().eq("userId", userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete notification error:", error);
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
    }
}
