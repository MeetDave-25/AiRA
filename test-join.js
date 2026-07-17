const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://yaqbjopgwshxzcwynskf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcWJqb3Bnd3NoeHpjd3luc2tmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIwNDkwOSwiZXhwIjoyMDk5NzgwOTA5fQ.-ofWxBkIxtCNiIkgulQU_NSMde2Tw6pVMN_KDPNgHHQ";

const db = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log("Querying first user with memberships...");
    const { data: users, error } = await db
        .from("User")
        .select("id, name, email, role, TeamMembership(teamId, Team(id, name, color))")
        .limit(3);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Users:", JSON.stringify(users, null, 2));
    }
}

testQuery();
