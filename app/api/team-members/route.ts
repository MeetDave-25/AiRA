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

        // A profile with no admin team: its own role text says whether it leads its group.
        const roleIsLead = (role?: string | null) => {
            const r = (role || "").toLowerCase();
            return !/\bmember\b/.test(r) && /\b(lead|leader|head|captain|chief|cto)\b/.test(r);
        };

        type TeamRef = { name: string; color: string | null; description: string | null; isLead: boolean };
        // One entry per person, keyed by normalised name; `teams` lists every team they belong to,
        // with lead/member decided per team (leading one team does not make them lead of another).
        const people = new Map<string, any>();

        profileList.forEach((p) => {
            const key = (p.name || "").trim().toLowerCase();
            if (!key) return;
            const own: TeamRef[] = p.teamGroup ? [{ name: p.teamGroup, color: null, description: null, isLead: roleIsLead(p.role) }] : [];
            people.set(key, { ...p, teams: own, fromAdminTeams: false });
        });

        // Teams created in /admin/teams are the source of truth for anyone who belongs to one.
        teamList.forEach((team: any) => {
            (team.TeamMembership || []).forEach((m: any) => {
                const user = m.User || {};
                const userName = (user.name || "").trim();
                const key = userName.toLowerCase() || (user.id ? `id-${user.id}` : "");
                if (!key) return;
                const ref: TeamRef = {
                    name: team.name,
                    color: team.color || "#00D4FF",
                    description: team.description || null,
                    isLead: m.memberRole === "TEAM_LEAD",
                };
                let person = people.get(key);
                if (!person) {
                    person = {
                        id: `team-user-${user.id || m.id}`,
                        name: userName,
                        role: user.role === "ADMIN" ? "Admin" : "Team Member",
                        bio: null,
                        photo: user.avatar || null,
                        linkedin: null,
                        github: null,
                        sortOrder: 10,
                        isPresident: false,
                        createdAt: m.joinedAt || team.createdAt || new Date().toISOString(),
                        teams: [],
                        fromAdminTeams: true,
                    };
                    people.set(key, person);
                }
                if (!person.fromAdminTeams) {
                    // First admin team replaces the free-text profile group.
                    person.teams = [];
                    person.fromAdminTeams = true;
                }
                if (!person.teams.some((t: TeamRef) => t.name === ref.name)) person.teams.push(ref);
                person.photo = person.photo || user.avatar || null;
            });
        });

        const merged = Array.from(people.values()).map((person) => {
            const { fromAdminTeams, ...rest } = person;
            void fromAdminTeams;
            const teamsOf: TeamRef[] = person.teams;
            const leadTeams = teamsOf.filter((t) => t.isLead);
            const primary = leadTeams[0] || teamsOf[0] || null;
            const isTeamLead = leadTeams.length > 0;
            const genericRole = !person.role || ["member", "team member", "admin"].includes(person.role.trim().toLowerCase());
            return {
                ...rest,
                teams: teamsOf,
                teamGroup: primary?.name || person.teamGroup || null,
                teamColor: primary?.color || null,
                teamDescription: primary?.description || null,
                isTeamLead,
                role: isTeamLead && genericRole ? `Team Lead - ${leadTeams[0].name}` : person.role,
                sortOrder: isTeamLead ? Math.min(person.sortOrder ?? 10, 1) : person.sortOrder ?? 10,
            };
        }).sort((a, b) => {
            if (a.isPresident !== b.isPresident) return a.isPresident ? -1 : 1;
            if (a.isTeamLead !== b.isTeamLead) return a.isTeamLead ? -1 : 1;
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });

        return NextResponse.json(merged, {
            headers: {
                "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120"
            }
        });
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
