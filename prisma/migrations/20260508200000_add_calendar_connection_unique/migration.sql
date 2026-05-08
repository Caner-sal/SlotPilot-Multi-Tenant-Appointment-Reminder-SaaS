-- CreateIndex
CREATE UNIQUE INDEX "CalendarConnection_organizationId_provider_key" ON "CalendarConnection"("organizationId", "provider");
