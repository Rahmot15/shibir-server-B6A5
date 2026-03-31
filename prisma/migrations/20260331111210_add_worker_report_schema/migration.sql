-- CreateEnum
CREATE TYPE "WorkerNumericMetric" AS ENUM ('QURAN_AYAH', 'HADITH_COUNT', 'SAHITYA_PAGE', 'TEXTBOOK_HOURS', 'NAMAZ_JAMAAT', 'NAMAZ_QAZA', 'CONTACT_MEMBER', 'CONTACT_SATHI', 'CONTACT_KORMI', 'CONTACT_SOMORTHOK', 'CONTACT_BONDHU', 'CONTACT_MEDHABI', 'CONTACT_VORTAKANGKHI', 'CONTACT_MUHARRAMA', 'DIST_SAHITYA', 'DIST_MAGAZINE', 'DIST_STICKER_CARD', 'DIST_UPOHAR', 'ORG_DAWATI', 'ORG_SANGOTHONIK');

-- CreateEnum
CREATE TYPE "WorkerCheckboxMetric" AS ENUM ('CLASS', 'SPORTS', 'NEWSPAPER', 'SELFCRIT');

-- CreateTable
CREATE TABLE "worker_report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reporterRole" "Role" NOT NULL,
    "month" DATE NOT NULL,
    "name" TEXT,
    "institution" TEXT,
    "thana" TEXT,
    "zila" TEXT,
    "phone" TEXT,
    "planSnapshot" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_report_numeric_entry" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "metric" "WorkerNumericMetric" NOT NULL,
    "day" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "worker_report_numeric_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_report_checkbox_entry" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "metric" "WorkerCheckboxMetric" NOT NULL,
    "day" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "worker_report_checkbox_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_advice" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_advice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_report_reporterId_idx" ON "worker_report"("reporterId");

-- CreateIndex
CREATE INDEX "worker_report_reporterRole_idx" ON "worker_report"("reporterRole");

-- CreateIndex
CREATE UNIQUE INDEX "worker_report_reporterId_month_key" ON "worker_report"("reporterId", "month");

-- CreateIndex
CREATE INDEX "worker_report_numeric_entry_reportId_day_idx" ON "worker_report_numeric_entry"("reportId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "worker_report_numeric_entry_reportId_metric_day_key" ON "worker_report_numeric_entry"("reportId", "metric", "day");

-- CreateIndex
CREATE INDEX "worker_report_checkbox_entry_reportId_day_idx" ON "worker_report_checkbox_entry"("reportId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "worker_report_checkbox_entry_reportId_metric_day_key" ON "worker_report_checkbox_entry"("reportId", "metric", "day");

-- CreateIndex
CREATE INDEX "worker_advice_reportId_idx" ON "worker_advice"("reportId");

-- AddForeignKey
ALTER TABLE "worker_report" ADD CONSTRAINT "worker_report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_report_numeric_entry" ADD CONSTRAINT "worker_report_numeric_entry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "worker_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_report_checkbox_entry" ADD CONSTRAINT "worker_report_checkbox_entry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "worker_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_advice" ADD CONSTRAINT "worker_advice_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "worker_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_advice" ADD CONSTRAINT "worker_advice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
