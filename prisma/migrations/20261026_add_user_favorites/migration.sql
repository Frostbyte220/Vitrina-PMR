-- AddColumn: favorites String[] to User model
-- Applied via: npx prisma db push (2026-10-26)

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "favorites" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
