import { db } from "./lib/db";
async function test() {
    const { data } = await db.from("User").select("email, role, TeamMembership(Team(name))");
    console.log(JSON.stringify(data, null, 2));
}
test();
