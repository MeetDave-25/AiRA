import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const [eventsStat, membersStat, achievesStat] = await Promise.all([
            db.from("Event").select("participantCount", { count: "exact" }),
            db.from("TeamMemberProfile").select("id", { count: "exact" }),
            db.from("Achievement").select("id", { count: "exact" })
        ]);

        let sumParticipants = 0;
        if (eventsStat.data) {
            sumParticipants = eventsStat.data.reduce((acc, event) => acc + (event.participantCount || 0), 0);
        }

        return NextResponse.json({
            events: eventsStat.count || 0,
            members: membersStat.count || 0,
            achievements: achievesStat.count || 0,
            participants: sumParticipants
        });
    } catch (error) {
        console.error("Public stats error:", error);
        return NextResponse.json({ events: 0, members: 0, achievements: 0, participants: 0 }, { status: 500 });
    }
}
