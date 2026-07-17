-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "pointsAwarded" INTEGER;

UPDATE "attendance"
SET "pointsAwarded" = "events"."rewardPoints"
FROM "events"
WHERE "attendance"."eventId" = "events"."id";

ALTER TABLE "attendance" ALTER COLUMN "pointsAwarded" SET NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "minimumPoints" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pointDecayIntervalMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "pointDecayPercent" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "pointGraceMinutes" INTEGER NOT NULL DEFAULT 15;
