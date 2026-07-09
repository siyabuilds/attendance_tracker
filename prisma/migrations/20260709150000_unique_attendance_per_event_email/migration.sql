-- CreateIndex
CREATE UNIQUE INDEX "attendance_eventId_email_key" ON "attendance"("eventId", "email");
