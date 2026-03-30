-- CreateEnum
CREATE TYPE "SupporterNumericMetric" AS ENUM ('QURAN', 'HADITH', 'ISLAMIC_BOOK', 'TEXTBOOK_HOURS', 'FRIENDS_CONTACT', 'GOODWORK_HOURS', 'NAMAZ_JAMAAT', 'NAMAZ_QAZA');

-- CreateEnum
CREATE TYPE "SupporterCheckboxMetric" AS ENUM ('CLASS', 'SELFCRIT', 'SPORTS', 'NEWSPAPER');

-- CreateTable
CREATE TABLE "supporter_report" (
    "id" TEXT NOT NULL,
    "supporterId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "name" TEXT,
    "school" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supporter_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supporter_report_numeric_entry" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "metric" "SupporterNumericMetric" NOT NULL,
    "day" INTEGER NOT NULL,
    "value" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "supporter_report_numeric_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supporter_report_checkbox_entry" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "metric" "SupporterCheckboxMetric" NOT NULL,
    "day" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "supporter_report_checkbox_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supporter_advice" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supporter_advice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "supporter_report_supporterId_idx" ON "supporter_report"("supporterId");

-- CreateIndex
CREATE UNIQUE INDEX "supporter_report_supporterId_month_key" ON "supporter_report"("supporterId", "month");

-- CreateIndex
CREATE INDEX "supporter_report_numeric_entry_reportId_day_idx" ON "supporter_report_numeric_entry"("reportId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "supporter_report_numeric_entry_reportId_metric_day_key" ON "supporter_report_numeric_entry"("reportId", "metric", "day");

-- CreateIndex
CREATE INDEX "supporter_report_checkbox_entry_reportId_day_idx" ON "supporter_report_checkbox_entry"("reportId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "supporter_report_checkbox_entry_reportId_metric_day_key" ON "supporter_report_checkbox_entry"("reportId", "metric", "day");

-- CreateIndex
CREATE INDEX "supporter_advice_reportId_idx" ON "supporter_advice"("reportId");

-- AddForeignKey
ALTER TABLE "supporter_report" ADD CONSTRAINT "supporter_report_supporterId_fkey" FOREIGN KEY ("supporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_report_numeric_entry" ADD CONSTRAINT "supporter_report_numeric_entry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "supporter_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_report_checkbox_entry" ADD CONSTRAINT "supporter_report_checkbox_entry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "supporter_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_advice" ADD CONSTRAINT "supporter_advice_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "supporter_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporter_advice" ADD CONSTRAINT "supporter_advice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
