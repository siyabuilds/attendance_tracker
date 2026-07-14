-- CreateTable
CREATE TABLE "event_questions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "event_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_answers" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "attendance_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_questions_eventId_order_key" ON "event_questions"("eventId", "order");

-- CreateIndex
CREATE INDEX "event_questions_eventId_idx" ON "event_questions"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_answers_attendanceId_questionId_key" ON "attendance_answers"("attendanceId", "questionId");

-- CreateIndex
CREATE INDEX "attendance_answers_questionId_idx" ON "attendance_answers"("questionId");

-- AddForeignKey
ALTER TABLE "event_questions" ADD CONSTRAINT "event_questions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_answers" ADD CONSTRAINT "attendance_answers_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_answers" ADD CONSTRAINT "attendance_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "event_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;