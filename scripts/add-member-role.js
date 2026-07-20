require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log("Adding memberRole column to TeamMembership...");

  // Add memberRole column with default TEAM_MEMBER
  const { error } = await db.rpc("exec_sql", {
    sql: `ALTER TABLE "TeamMembership" ADD COLUMN IF NOT EXISTS "memberRole" TEXT NOT NULL DEFAULT 'TEAM_MEMBER';`
  });

  if (error) {
    // Try direct query approach if rpc not available
    console.log("RPC not available, trying direct approach...");
    // Check by reading a row to see if column exists
    const { data, error: readErr } = await db.from("TeamMembership").select("memberRole").limit(1);
    if (readErr && readErr.message.includes("column")) {
      console.error("Column does not exist and could not be created via RPC.");
      console.error("Please run this SQL manually in Supabase SQL Editor:");
      console.error(`ALTER TABLE "TeamMembership" ADD COLUMN IF NOT EXISTS "memberRole" TEXT NOT NULL DEFAULT 'TEAM_MEMBER';`);
    } else {
      console.log("Column memberRole already exists or was created!");
    }
  } else {
    console.log("SUCCESS: memberRole column added to TeamMembership!");
  }

  // Now set existing TEAM_LEAD users' memberships to TEAM_LEAD role
  console.log("Setting existing TEAM_LEAD users' memberships to TEAM_LEAD...");
  const { data: leads } = await db.from("User").select("id").eq("role", "TEAM_LEAD");
  if (leads && leads.length > 0) {
    const leadIds = leads.map(l => l.id);
    const { error: updateErr } = await db
      .from("TeamMembership")
      .update({ memberRole: "TEAM_LEAD" })
      .in("userId", leadIds);
    if (updateErr) console.error("Error updating lead memberships:", updateErr.message);
    else console.log(`Updated ${leadIds.length} TEAM_LEAD user memberships.`);
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);
