import { createClient, SupabaseClient } from "@supabase/supabase-js";

function createDb(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL is not set");
    }
    if (!supabaseServiceKey) {
        throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY is not set");
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Lazy singleton — only initialised on first use (so env vars are resolved at runtime)
let _db: SupabaseClient | null = null;

export const db = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_db) _db = createDb();
        return (_db as any)[prop];
    },
});
