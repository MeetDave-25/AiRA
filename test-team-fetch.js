const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://yaqbjopgwshxzcwynskf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcWJqb3Bnd3NoeHpjd3luc2tmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIwNDkwOSwiZXhwIjoyMDk5NzgwOTA5fQ.-ofWxBkIxtCNiIkgulQU_NSMde2Tw6pVMN_KDPNgHHQ"; // service role

const db = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    // Let's pretend userId = '37ff3c49-3ccd-4994-812b-74813dbcf1f1' (user KLLL)
    const userId = '37ff3c49-3ccd-4994-812b-74813dbcf1f1';
    
    // Simulate what the API does:
    const { data: userMemberships } = await db
        .from("TeamMembership")
        .select("teamId")
        .eq("userId", userId);
    
    console.log("User memberships:", userMemberships);

    const allowedTeamIds = (userMemberships || []).map(m => m.teamId);
    console.log("Allowed ids:", allowedTeamIds);

    if (allowedTeamIds.length > 0) {
        let query = db
            .from("Team")
            .select("*, TeamMembership(*, User(id, name, email, role, avatar))")
            .order("createdAt", { ascending: true })
            .in("id", allowedTeamIds);
        
        const { data: teams, error } = await query;
        if (error) console.error("Error:", error);
        console.log("Returned teams size:", teams?.length);
        console.log("First returned team id:", teams?.[0]?.id);
    }
}
testQuery();
