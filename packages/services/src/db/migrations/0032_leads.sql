CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"offer_interest" text,
	"profession" text,
	"message" text,
	"consent_text_version" text NOT NULL,
	"contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_type_check" CHECK ("leads"."type" in ('patient_pilot', 'info_request', 'practitioner_pilot')),
	CONSTRAINT "leads_offer_interest_check" CHECK ("leads"."offer_interest" is null or "leads"."offer_interest" in ('genetic', 'consultation', 'undecided'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "leads_type_email_idx" ON "leads" USING btree ("type","email");
