import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const [eventsStat, membersStat, achievesStat, settingsStat] = await Promise.all([
            db.from("Event").select("participantCount", { count: "exact" }),
            db.from("TeamMemberProfile").select("id", { count: "exact" }),
            db.from("Achievement").select("id", { count: "exact" }),
            db.from("LabSetting").select("key, value")
        ]);

        let sumParticipants = 0;
        if (eventsStat.data) {
            sumParticipants = eventsStat.data.reduce((acc, event) => acc + (Number(event.participantCount) || 0), 0);
        }

        const settingsMap: Record<string, string> = {};
        (settingsStat.data || []).forEach((s: any) => {
            if (s.key && s.value) settingsMap[s.key] = s.value;
        });

        // Compute live values
        const liveEvents = eventsStat.count ?? (eventsStat.data?.length || 0);
        const liveMembers = membersStat.count ?? (membersStat.data?.length || 0);
        const liveAchievements = achievesStat.count ?? (achievesStat.data?.length || 0);
        const liveParticipants = sumParticipants;

        // Custom override settings if configured by admin, otherwise use live
        const customEvents = settingsMap.stat_events ? parseInt(settingsMap.stat_events, 10) : NaN;
        const customMembers = settingsMap.stat_members ? parseInt(settingsMap.stat_members, 10) : NaN;
        const customAchievements = settingsMap.stat_achievements ? parseInt(settingsMap.stat_achievements, 10) : NaN;
        const customParticipants = settingsMap.stat_participants ? parseInt(settingsMap.stat_participants, 10) : NaN;

        return NextResponse.json({
            events: !isNaN(customEvents) ? customEvents : liveEvents,
            members: !isNaN(customMembers) ? customMembers : liveMembers,
            achievements: !isNaN(customAchievements) ? customAchievements : liveAchievements,
            participants: !isNaN(customParticipants) ? customParticipants : liveParticipants,
            live: {
                events: liveEvents,
                members: liveMembers,
                achievements: liveAchievements,
                participants: liveParticipants
            }
        });
    } catch (error) {
        console.error("Public stats error:", error);
        return NextResponse.json({
            events: 0,
            members: 0,
            achievements: 0,
            participants: 0,
            live: { events: 0, members: 0, achievements: 0, participants: 0 }
        }, { status: 500 });
    }
}
