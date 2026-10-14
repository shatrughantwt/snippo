CREATE TABLE "snippets" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"code" text NOT NULL,
	"lang" text NOT NULL,
	"ext" text NOT NULL,
	"color" text NOT NULL,
	"lines" integer NOT NULL,
	"preview" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;