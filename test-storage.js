const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://yaqbjopgwshxzcwynskf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcWJqb3Bnd3NoeHpjd3luc2tmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIwNDkwOSwiZXhwIjoyMDk5NzgwOTA5fQ.-ofWxBkIxtCNiIkgulQU_NSMde2Tw6pVMN_KDPNgHHQ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
    console.log("Testing upload to 'events' bucket...");
    try {
        const buffer = Buffer.from("Hello world, this is a test image content");
        const filename = "test-image-" + Date.now() + ".png";

        const { data, error } = await supabase.storage
            .from("events")
            .upload(filename, buffer, {
                cacheControl: "3600",
                upsert: false,
                contentType: "image/png"
            });

        if (error) {
            console.error("SUPABASE STORAGE UPLOAD ERROR:", error);
            return;
        }
        console.log("Upload Success:", data);

        const { data: publicUrlData } = supabase.storage.from("events").getPublicUrl(filename);
        console.log("Public URL:", publicUrlData.publicUrl);
    } catch (e) {
        console.error("Exception:", e);
    }
}

testStorage();
