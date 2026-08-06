-- ============================================================
-- AiRA Labs — Event Participation Form System
-- Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- 1. EventForm — one form per event
CREATE TABLE IF NOT EXISTS "EventForm" (
    "id"         TEXT        NOT NULL PRIMARY KEY,
    "eventId"    TEXT        NOT NULL,
    "isOpen"     BOOLEAN     NOT NULL DEFAULT TRUE,
    "deadline"   TIMESTAMPTZ,
    "maxSlots"   INTEGER,
    "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "EventForm_eventId_key" UNIQUE ("eventId")
);

-- 2. EventFormField — fields for a form
CREATE TABLE IF NOT EXISTS "EventFormField" (
    "id"          TEXT        NOT NULL PRIMARY KEY,
    "formId"      TEXT        NOT NULL,
    "label"       TEXT        NOT NULL,
    "fieldType"   TEXT        NOT NULL DEFAULT 'text',
    "isRequired"  BOOLEAN     NOT NULL DEFAULT TRUE,
    "placeholder" TEXT,
    "options"     TEXT[]      DEFAULT '{}',
    "sortOrder"   INTEGER     NOT NULL DEFAULT 0,
    "isBuiltIn"   BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT "EventFormField_formId_fkey"
        FOREIGN KEY ("formId") REFERENCES "EventForm"("id") ON DELETE CASCADE
);

-- 3. EventRegistration — one per participant per form
CREATE TABLE IF NOT EXISTS "EventRegistration" (
    "id"          TEXT        NOT NULL PRIMARY KEY,
    "formId"      TEXT        NOT NULL,
    "eventId"     TEXT        NOT NULL,
    "submittedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "status"      TEXT        NOT NULL DEFAULT 'PENDING',
    "notes"       TEXT,
    CONSTRAINT "EventRegistration_formId_fkey"
        FOREIGN KEY ("formId") REFERENCES "EventForm"("id") ON DELETE CASCADE
);

-- 4. EventRegistrationAnswer — answers per registration
CREATE TABLE IF NOT EXISTS "EventRegistrationAnswer" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "fieldId"        TEXT NOT NULL,
    "fieldLabel"     TEXT NOT NULL,
    "value"          TEXT NOT NULL DEFAULT '',
    CONSTRAINT "EventRegistrationAnswer_registrationId_fkey"
        FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_eventformfield_formid" ON "EventFormField"("formId");
CREATE INDEX IF NOT EXISTS "idx_eventregistration_formid" ON "EventRegistration"("formId");
CREATE INDEX IF NOT EXISTS "idx_eventregistration_eventid" ON "EventRegistration"("eventId");
CREATE INDEX IF NOT EXISTS "idx_eventregistrationanswer_regid" ON "EventRegistrationAnswer"("registrationId");
