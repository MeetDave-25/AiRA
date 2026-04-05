import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { generatePassword } from "@/lib/utils";

type OfflineEvent = {
    id: string;
    title: string;
    date: string;
    venue: string;
    mentor: string | null;
    coMentor: string | null;
    coInstructors: string[];
    supportingTeam: string[];
    participantCount: number;
    organizedBy: string | null;
    leadBy: string | null;
    objective: string | null;
    description: string | null;
    outcome: string | null;
    isUpcoming: boolean;
    createdAt: string;
    updatedAt: string;
    images: any[];
    assignments: any[];
};

type OfflineTeam = {
    id: string;
    name: string;
    description: string | null;
    color: string;
    createdAt: string;
    updatedAt: string;
};

type OfflineUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    password: string;
    createdAt: string;
    updatedAt: string;
};

type OfflineMembership = {
    id: string;
    userId: string;
    teamId: string;
    joinedAt: string;
};

type OfflineTeamMemberProfile = {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    photo: string | null;
    linkedin: string | null;
    github: string | null;
    teamGroup: string | null;
    sortOrder: number;
    isPresident: boolean;
    createdAt: string;
    updatedAt: string;
};

type OfflineStore = {
    events: OfflineEvent[];
    teams: OfflineTeam[];
    users: OfflineUser[];
    teamMemberships: OfflineMembership[];
    teamMemberProfiles: OfflineTeamMemberProfile[];
};

const STORE_DIR = path.join(process.cwd(), ".dist");
const STORE_FILE = path.join(STORE_DIR, "offline-admin-store.json");

const DEFAULT_STORE: OfflineStore = {
    events: [],
    teams: [],
    users: [],
    teamMemberships: [],
    teamMemberProfiles: [],
};

function nowIso() {
    return new Date().toISOString();
}

export function isDbOfflineError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error || "");
    return (
        message.includes("P1001") ||
        message.includes("Can't reach database server") ||
        message.includes("ECONNREFUSED") ||
        message.includes("ENOTFOUND") ||
        message.includes("Connection terminated")
    );
}

async function ensureStoreDir() {
    await mkdir(STORE_DIR, { recursive: true });
}

async function readStore(): Promise<OfflineStore> {
    try {
        const raw = await readFile(STORE_FILE, "utf8");
        const parsed = JSON.parse(raw) as Partial<OfflineStore>;
        return {
            events: parsed.events || [],
            teams: parsed.teams || [],
            users: parsed.users || [],
            teamMemberships: parsed.teamMemberships || [],
            teamMemberProfiles: parsed.teamMemberProfiles || [],
        };
    } catch {
        await ensureStoreDir();
        await writeFile(STORE_FILE, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
        return { ...DEFAULT_STORE };
    }
}

async function writeStore(store: OfflineStore) {
    await ensureStoreDir();
    await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function listEventsOffline() {
    const store = await readStore();
    return [...store.events].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getEventOffline(eventId: string) {
    const store = await readStore();
    return store.events.find((e) => e.id === eventId) || null;
}

export async function createEventOffline(payload: any) {
    const store = await readStore();
    const timestamp = nowIso();
    const event: OfflineEvent = {
        id: `evt_${randomUUID()}`,
        title: String(payload.title || "").trim(),
        date: payload.date ? new Date(payload.date).toISOString() : timestamp,
        venue: String(payload.venue || "").trim(),
        mentor: payload.mentor || null,
        coMentor: payload.coMentor || null,
        coInstructors: Array.isArray(payload.coInstructors) ? payload.coInstructors : [],
        supportingTeam: Array.isArray(payload.supportingTeam) ? payload.supportingTeam : [],
        participantCount: Number(payload.participantCount || 0),
        organizedBy: payload.organizedBy || null,
        leadBy: payload.leadBy || null,
        objective: payload.objective || null,
        description: payload.description || null,
        outcome: payload.outcome || null,
        isUpcoming: payload.isUpcoming === true || payload.isUpcoming === "true",
        createdAt: timestamp,
        updatedAt: timestamp,
        images: [],
        assignments: [],
    };

    store.events.unshift(event);
    await writeStore(store);
    return event;
}

export async function updateEventOffline(eventId: string, payload: any) {
    const store = await readStore();
    const idx = store.events.findIndex((e) => e.id === eventId);
    if (idx < 0) return null;

    const current = store.events[idx];
    const updated: OfflineEvent = {
        ...current,
        ...payload,
        date: payload.date ? new Date(payload.date).toISOString() : current.date,
        coInstructors: Array.isArray(payload.coInstructors) ? payload.coInstructors : current.coInstructors,
        supportingTeam: Array.isArray(payload.supportingTeam) ? payload.supportingTeam : current.supportingTeam,
        participantCount: payload.participantCount !== undefined ? Number(payload.participantCount || 0) : current.participantCount,
        updatedAt: nowIso(),
    };

    store.events[idx] = updated;
    await writeStore(store);
    return updated;
}

export async function deleteEventOffline(eventId: string) {
    const store = await readStore();
    const before = store.events.length;
    store.events = store.events.filter((e) => e.id !== eventId);
    await writeStore(store);
    return before !== store.events.length;
}

export async function listTeamsOffline() {
    const store = await readStore();
    const teams = [...store.teams].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return teams.map((team) => {
        const memberships = store.teamMemberships
            .filter((m) => m.teamId === team.id)
            .map((membership) => {
                const user = store.users.find((u) => u.id === membership.userId);
                return {
                    ...membership,
                    user: user
                        ? {
                              id: user.id,
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              avatar: user.avatar,
                          }
                        : null,
                };
            })
            .filter((m) => !!m.user);

        return {
            ...team,
            memberships,
            _count: { assignments: 0, tasks: 0 },
        };
    });
}

export async function createTeamOffline(payload: any) {
    const store = await readStore();
    const timestamp = nowIso();
    const team: OfflineTeam = {
        id: `team_${randomUUID()}`,
        name: String(payload.name || "").trim(),
        description: payload.description ? String(payload.description) : null,
        color: payload.color || "#00D4FF",
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    store.teams.push(team);
    await writeStore(store);
    return team;
}

export async function updateTeamOffline(teamId: string, payload: any) {
    const store = await readStore();
    const idx = store.teams.findIndex((t) => t.id === teamId);
    if (idx < 0) return null;

    const current = store.teams[idx];
    const updated: OfflineTeam = {
        ...current,
        ...payload,
        updatedAt: nowIso(),
    };

    store.teams[idx] = updated;
    await writeStore(store);
    return updated;
}

export async function deleteTeamOffline(teamId: string) {
    const store = await readStore();
    const before = store.teams.length;
    store.teams = store.teams.filter((t) => t.id !== teamId);
    store.teamMemberships = store.teamMemberships.filter((m) => m.teamId !== teamId);
    await writeStore(store);
    return before !== store.teams.length;
}

export async function listTeamMembershipsOffline(teamId: string) {
    const store = await readStore();
    return store.teamMemberships
        .filter((m) => m.teamId === teamId)
        .map((m) => {
            const user = store.users.find((u) => u.id === m.userId);
            return {
                ...m,
                user: user
                    ? {
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: user.role,
                          avatar: user.avatar,
                      }
                    : null,
            };
        })
        .filter((m) => !!m.user);
}

export async function addTeamMemberOffline(teamId: string, payload: { name?: string; email?: string; role?: string }) {
    const store = await readStore();

    const normalizedName = String(payload.name || "").trim();
    if (!normalizedName) {
        throw new Error("Name is required");
    }

    let loginId = String(payload.email || "").trim().toLowerCase();
    if (!loginId) {
        const slug = normalizedName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ".")
            .replace(/^\.+|\.+$/g, "") || "member";

        loginId = `${slug}@airalabs.local`;
        let counter = 1;
        while (store.users.some((u) => u.email === loginId)) {
            loginId = `${slug}.${counter}@airalabs.local`;
            counter += 1;
        }
    }

    const password = generatePassword(12);

    let user = store.users.find((u) => u.email === loginId);
    if (!user) {
        user = {
            id: `usr_${randomUUID()}`,
            name: normalizedName,
            email: loginId,
            role: payload.role || "TEAM_MEMBER",
            avatar: null,
            password,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        };
        store.users.push(user);
    } else {
        user.name = normalizedName;
        user.role = payload.role || user.role;
        user.password = password;
        user.updatedAt = nowIso();
    }

    let membership = store.teamMemberships.find((m) => m.userId === user.id && m.teamId === teamId);
    if (!membership) {
        membership = {
            id: `mem_${randomUUID()}`,
            userId: user.id,
            teamId,
            joinedAt: nowIso(),
        };
        store.teamMemberships.push(membership);
    }

    await writeStore(store);

    return {
        membership,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        generatedLoginId: loginId,
        generatedPassword: password,
    };
}

export async function listTeamMemberProfilesOffline() {
    const store = await readStore();
    return [...store.teamMemberProfiles].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return +new Date(a.createdAt) - +new Date(b.createdAt);
    });
}

export async function createTeamMemberProfileOffline(payload: any) {
    const store = await readStore();
    const timestamp = nowIso();

    const isPresident = payload.isPresident === true || payload.isPresident === "true";
    if (isPresident) {
        store.teamMemberProfiles = store.teamMemberProfiles.map((profile) => ({
            ...profile,
            isPresident: false,
            updatedAt: timestamp,
        }));
    }

    const profile: OfflineTeamMemberProfile = {
        id: `tmp_${randomUUID()}`,
        name: String(payload.name || "").trim(),
        role: String(payload.role || "Member").trim(),
        bio: payload.bio || null,
        photo: payload.photo || null,
        linkedin: payload.linkedin || null,
        github: payload.github || null,
        teamGroup: payload.teamGroup || null,
        sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder || 0) : 0,
        isPresident,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    store.teamMemberProfiles.push(profile);
    await writeStore(store);
    return profile;
}

export async function updateTeamMemberProfileOffline(id: string, payload: any) {
    const store = await readStore();
    const idx = store.teamMemberProfiles.findIndex((m) => m.id === id);
    if (idx < 0) return null;

    const timestamp = nowIso();
    const isPresident = payload.isPresident === true || payload.isPresident === "true";
    if (isPresident) {
        store.teamMemberProfiles = store.teamMemberProfiles.map((profile) => ({
            ...profile,
            isPresident: profile.id === id,
            updatedAt: timestamp,
        }));
    }

    const current = store.teamMemberProfiles[idx];
    const updated: OfflineTeamMemberProfile = {
        ...current,
        ...payload,
        sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder || 0) : current.sortOrder,
        isPresident,
        updatedAt: timestamp,
    };

    store.teamMemberProfiles[idx] = updated;
    await writeStore(store);
    return updated;
}

export async function deleteTeamMemberProfileOffline(id: string) {
    const store = await readStore();
    const before = store.teamMemberProfiles.length;
    store.teamMemberProfiles = store.teamMemberProfiles.filter((m) => m.id !== id);
    await writeStore(store);
    return before !== store.teamMemberProfiles.length;
}
