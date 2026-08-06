import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

// GET — admin: list all registrations with answers
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id: eventId } = params;

    const { data: form } = await db
        .from("EventForm")
        .select("id")
        .eq("eventId", eventId)
        .maybeSingle();

    if (!form) return NextResponse.json({ registrations: [] });

    const { data: registrations, error } = await db
        .from("EventRegistration")
        .select("*, EventRegistrationAnswer(*)")
        .eq("formId", form.id)
        .order("submittedAt", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formatted = (registrations || []).map((r: any) => ({
        ...r,
        answers: (r.EventRegistrationAnswer || []).sort((a: any, b: any) =>
            a.fieldLabel.localeCompare(b.fieldLabel)
        ),
    }));

    return NextResponse.json({ registrations: formatted, total: formatted.length });
}

// POST — public: submit a registration
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id: eventId } = params;
    const body = await req.json();

    // Fetch form
    const { data: form, error: formError } = await db
        .from("EventForm")
        .select("*, EventFormField(*)")
        .eq("eventId", eventId)
        .maybeSingle();

    if (formError || !form) {
        return NextResponse.json({ error: "Registration form not found for this event" }, { status: 404 });
    }

    // Check if form is open
    if (!form.isOpen) {
        return NextResponse.json({ error: "Registration is currently closed for this event" }, { status: 403 });
    }

    // Check deadline
    if (form.deadline && new Date(form.deadline) < new Date()) {
        return NextResponse.json({ error: "Registration deadline has passed" }, { status: 403 });
    }

    // Check slot cap
    if (form.maxSlots) {
        const { count } = await db
            .from("EventRegistration")
            .select("id", { count: "exact", head: true })
            .eq("formId", form.id);

        if ((count || 0) >= form.maxSlots) {
            return NextResponse.json({ error: "Registration is full — no slots remaining" }, { status: 403 });
        }
    }

    // Check duplicate email
    const fields = form.EventFormField || [];
    const emailField = fields.find((f: any) => f.label === "Email");
    if (emailField && body.answers) {
        const emailAnswer = body.answers.find((a: any) => a.fieldId === emailField.id);
        if (emailAnswer?.value) {
            const { data: existing } = await db
                .from("EventRegistrationAnswer")
                .select("id, registrationId")
                .eq("fieldId", emailField.id)
                .ilike("value", emailAnswer.value.trim())
                .limit(1);

            if (existing && existing.length > 0) {
                // Check that registration is for the same form
                const { data: existingReg } = await db
                    .from("EventRegistration")
                    .select("id")
                    .eq("id", existing[0].registrationId)
                    .eq("formId", form.id)
                    .maybeSingle();

                if (existingReg) {
                    return NextResponse.json({
                        error: "You have already registered for this event with this email address"
                    }, { status: 409 });
                }
            }
        }
    }

    // Validate required fields
    if (!Array.isArray(body.answers)) {
        return NextResponse.json({ error: "answers is required" }, { status: 400 });
    }

    const requiredFields = fields.filter((f: any) => f.isRequired);
    for (const field of requiredFields) {
        const answer = body.answers.find((a: any) => a.fieldId === field.id);
        if (!answer || !answer.value?.trim()) {
            return NextResponse.json({
                error: `"${field.label}" is required`
            }, { status: 400 });
        }
    }

    // Create registration
    const registrationId = uuidv4();
    const now = new Date().toISOString();

    const { error: regError } = await db
        .from("EventRegistration")
        .insert({
            id: registrationId,
            formId: form.id,
            eventId,
            submittedAt: now,
            status: "PENDING",
        });

    if (regError) return NextResponse.json({ error: regError.message }, { status: 500 });

    // Insert answers
    const answerInserts = body.answers
        .filter((a: any) => a.value !== undefined && a.value !== null)
        .map((a: any) => {
            const field = fields.find((f: any) => f.id === a.fieldId);
            return {
                id: uuidv4(),
                registrationId,
                fieldId: a.fieldId,
                fieldLabel: field?.label || a.fieldId,
                value: String(a.value || "").trim(),
            };
        });

    if (answerInserts.length > 0) {
        await db.from("EventRegistrationAnswer").insert(answerInserts);
    }

    return NextResponse.json({
        success: true,
        registrationId,
        message: "Registration submitted successfully!"
    }, { status: 201 });
}
