import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireLeadOrAdmin } from "@/lib/admin-guard";

export async function PATCH(req: NextRequest, { params }: { params: { id: string; userId: string } }) {
    const auth = await requireLeadOrAdmin(params.id);
    if (auth.error) return auth.error;

    try {
        const body = await req.json().catch(() => ({}));
        const targetRole = body.role === "TEAM_LEAD" ? "TEAM_LEAD" : "TEAM_MEMBER";

        // 1. Update TeamMembership
        const { data: mem, error: memErr } = await db
            .from("TeamMembership")
            .update({ memberRole: targetRole })
            .eq("teamId", params.id)
            .eq("userId", params.userId)
            .select()
            .single();

        if (memErr) throw memErr;

        // 2. Sync to User table if not ADMIN
        const { data: user } = await db.from("User").select("id, name, email, role").eq("id", params.userId).maybeSingle();
        if (user && user.role !== "ADMIN") {
            await db.from("User").update({
                role: targetRole,
                updatedAt: new Date().toISOString(),
            }).eq("id", params.userId);
        }

        // 3. Sync to TeamMemberProfile if matching by name or email
        if (user?.name) {
            const { data: profile } = await db
                .from("TeamMemberProfile")
                .select("id, role")
                .ilike("name", user.name)
                .maybeSingle();

            if (profile) {
                const currentRole = profile.role || "";
                if (targetRole === "TEAM_LEAD" && !currentRole.toLowerCase().includes("lead")) {
                    await db.from("TeamMemberProfile").update({
                        role: `Team Lead - ${currentRole || "Engineering"}`,
                    }).eq("id", profile.id);
                } else if (targetRole === "TEAM_MEMBER" && currentRole.toLowerCase().includes("team lead")) {
                    await db.from("TeamMemberProfile").update({
                        role: currentRole.replace(/team lead\s*-\s*/i, "").trim() || "Team Member",
                    }).eq("id", profile.id);
                }
            }
        }

        return NextResponse.json({ success: true, memberRole: targetRole });
    } catch (error: any) {
        console.error("Update team member role error:", error);
        return NextResponse.json({ error: error?.message || "Failed to update member role" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; userId: string } }) {
    const auth = await requireLeadOrAdmin(params.id);
    if (auth.error) return auth.error;

    await db.from("TeamMembership").delete().eq("teamId", params.id).eq("userId", params.userId);
    return NextResponse.json({ success: true });
}
