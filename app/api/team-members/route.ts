import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        // 1. Fetch standalone TeamMemberProfile entries
        const { data: profiles } = await db
            .from("TeamMemberProfile")
            .select("*")
            .order("sortOrder", { ascending: true })
            .order("createdAt", { ascending: true });

        // 2. Fetch all Teams and their Memberships + Users from admin side
        const { data: teams } = await db
            .from("Team")
            .select("*, TeamMembership(*, User(id, name, email, role, avatar))")
            .order("createdAt", { ascending: true });

        const profileList = Array.isArray(profiles) ? [...profiles] : [];
        const teamList = Array.isArray(teams) ? teams : [];

        // Track merged member items by normalized user/profile identifier
        const processedMap = new Map<string, any>();

        // 3. Index existing TeamMemberProfiles
        profileList.forEach((p) => {
            const key = (p.name || "").trim().toLowerCase();
            if (key) {
                processedMap.set(key, { ...p });
            }
        });

        // 4. Merge actual Teams created from /admin/teams
        teamList.forEach((team: any) => {
            const teamMemberships = team.TeamMembership || [];
            
            teamMemberships.forEach((m: any) => {
                const user = m.User || {};
                const userName = (user.name || "").trim();
                const userKey = userName.toLowerCase();
                const isLead = m.memberRole === "TEAM_LEAD";

                if (userKey && processedMap.has(userKey)) {
                    // Update existing profile with Team membership info
                    const existing = processedMap.get(userKey);
                    processedMap.set(userKey, {
                        ...existing,
                        teamGroup: team.name,
                        teamColor: team.color || existing.teamColor || "#00D4FF",
                        teamDescription: team.description || existing.teamDescription || null,
                        isTeamLead: isLead || existing.isPresident || existing.isTeamLead,
                        sortOrder: isLead ? 1 : (existing.sortOrder || 10),
                        role: isLead && (!existing.role || existing.role === "Member" || existing.role === "Team Member")
                            ? `Team Lead - ${team.name}`
                            : (existing.role || (isLead ? "Team Lead" : "Team Member")),
                        photo: existing.photo || user.avatar || null,
                    });
                } else if (userName) {
                    // Create entry for team member from User / Team table
                    const newEntry = {
                        id: `team-user-${user.id || m.id}-${team.id}`,
                        name: userName,
                        role: isLead ? `Team Lead - ${team.name}` : (user.role === "ADMIN" ? "Admin" : "Team Member"),
                        bio: null,
                        photo: user.avatar || null,
                        linkedin: null,
                        github: null,
                        teamGroup: team.name,
                        teamColor: team.color || "#00D4FF",
                        teamDescription: team.description || null,
                        sortOrder: isLead ? 1 : 10,
                        isPresident: false,
                        isTeamLead: isLead,
                        createdAt: m.joinedAt || team.createdAt || new Date().toISOString(),
                    };
                    processedMap.set(userKey || `id-${user.id}`, newEntry);
                }
            });
        });

        const merged = Array.from(processedMap.values()).sort((a, b) => {
            if (a.isPresident && !b.isPresident) return -1;
            if (!a.isPresident && b.isPresident) return 1;
            if (a.isTeamLead && !b.isTeamLead) return -1;
            if (!a.isTeamLead && b.isTeamLead) return 1;
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });

        return NextResponse.json(merged);
    } catch (error) {
        console.error("Failed to load team members:", error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
        const name = (body.name || "").trim().slice(0, 150);
        const role = (body.role || "").trim().slice(0, 150);
        const bio = (body.bio || "").trim();
        const photo = (body.photo || "").trim();
        const linkedin = (body.linkedin || "").trim().slice(0, 255);
        const github = (body.github || "").trim().slice(0, 255);
        const teamGroup = (body.teamGroup || "").trim().slice(0, 150);

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Limit bio to 500 words or 3000 chars
        const wordCount = bio ? bio.split(/\s+/).length : 0;
        if (wordCount > 500 || bio.length > 3000) {
            return NextResponse.json({ 
                error: `Bio statement exceeds limit (max 500 words / 3,000 characters). Current: ${wordCount} words.` 
            }, { status: 400 });
        }

        const isPresident = body.isPresident === true || body.isPresident === "true";

        const { data, error } = await db
            .from("TeamMemberProfile")
            .insert({
                id: uuidv4(),
                name,
                role: role || (isPresident ? "Executive Lead" : "Member"),
                bio: bio || null,
                photo: photo || null,
                linkedin: linkedin || null,
                github: github || null,
                teamGroup: teamGroup || (isPresident ? "Founders & Executive Board" : "Core Team"),
                sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : 0,
                isPresident,
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create leader / team member", details: String(error) }, { status: 500 });
    }
}
