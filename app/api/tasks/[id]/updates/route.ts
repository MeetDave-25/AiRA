import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

async function canAccessTask(taskId: string, userId: string, role: string) {
    if (role === "ADMIN") return true;
    const { data: task } = await db.from("Task").select("teamId, assignedTo").eq("id", taskId).single();
    if (!task) return false;
    if (task.assignedTo === userId) return true;
    const { data: membership } = await db.from("TeamMembership").select("id").eq("userId", userId).eq("teamId", task.teamId).maybeSingle();
    return Boolean(membership);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    const userId = session.user.id;
    if (!(await canAccessTask(params.id, userId, role))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: updates } = await db
        .from("TaskUpdate")
        .select("*, User!authorId(id, name, email, role)")
        .eq("taskId", params.id)
        .order("createdAt", { ascending: false })
        .limit(30);

    return NextResponse.json(updates || []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    const userId = session.user.id;
    if (!(await canAccessTask(params.id, userId, role))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const message = String(body?.message || "").trim();
    if (!message) return NextResponse.json({ error: "Update message is required" }, { status: 400 });

    const newId = uuidv4();
    const { data: update, error } = await db
        .from("TaskUpdate")
        .insert({ id: newId, taskId: params.id, authorId: userId, message })
        .select("*, User!authorId(id, name, email, role)")
        .single();

    if (error) {
        console.error("TaskUpdate INSERT Error:", error);
        return NextResponse.json({ error: "Failed to create update", details: error.message }, { status: 500 });
    }

    // TRIGGER NOTIFICATION
    try {
        const { data: task } = await db.from("Task").select("title, teamId").eq("id", params.id).single();
        if (task) {
            let targetUsers: { id: string }[] = [];
            const notifTitle = `New update on "${task.title}"`;
            let notifMessage = `${session.user.name} posted an update.`;

            if (role === "TEAM_MEMBER" && task.teamId) {
                // Find Team Leads of this team
                const { data: leads } = await db.from("TeamMembership")
                    .select("userId, User!inner(role)")
                    .eq("teamId", task.teamId)
                    .eq("User.role", "TEAM_LEAD");
                if (leads) targetUsers = leads.map(l => ({ id: l.userId }));
            } else if (role === "TEAM_LEAD" || role === "CONTENT_MANAGER" || role === "CERTIFICATE_MANAGER") {
                // Find all Admins
                const { data: admins } = await db.from("User").select("id").eq("role", "ADMIN");
                if (admins) targetUsers = admins;
            }

            if (targetUsers.length > 0) {
                await db.from("Notification").insert(
                    targetUsers.map(t => ({
                        id: uuidv4(),
                        userId: t.id,
                        title: notifTitle,
                        message: notifMessage,
                        link: `/portal/tasks/${params.id}`,
                    }))
                );
            }
        }
    } catch (err) {
        console.error("Failed to notify:", err);
    }

    return NextResponse.json(update, { status: 201 });
}
