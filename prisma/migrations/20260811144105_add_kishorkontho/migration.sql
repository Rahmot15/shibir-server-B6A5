-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('STORY', 'POEM', 'SCIENCE', 'ISLAMIC', 'QUIZ', 'ART', 'TRAVEL');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('PHYSICAL', 'DIGITAL', 'BOTH');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BKASH', 'NAGAD', 'ROCKET', 'CARD', 'BANK');

-- CreateTable
CREATE TABLE "kishorkontho_issue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "coverImage" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pdfFull" TEXT,
    "pdfPreview" TEXT,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
    "purchaseType" "PurchaseType" NOT NULL DEFAULT 'BOTH',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "paymentMethods" "PaymentMethod"[],
    "subscriptionEligible" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'Bangla',
    "publisherName" TEXT NOT NULL,
    "publisherOrg" TEXT NOT NULL,
    "editorName" TEXT NOT NULL,
    "editorRole" TEXT NOT NULL DEFAULT 'Editor',
    "tags" TEXT[],
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "purchases" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kishorkontho_issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kishorkontho_content" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "page" INTEGER NOT NULL,

    CONSTRAINT "kishorkontho_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kishorkontho_review" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kishorkontho_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kishorkontho_issue_slug_key" ON "kishorkontho_issue"("slug");

-- CreateIndex
CREATE INDEX "kishorkontho_issue_slug_idx" ON "kishorkontho_issue"("slug");

-- CreateIndex
CREATE INDEX "kishorkontho_issue_year_month_idx" ON "kishorkontho_issue"("year", "month");

-- CreateIndex
CREATE INDEX "kishorkontho_issue_isAvailable_idx" ON "kishorkontho_issue"("isAvailable");

-- CreateIndex
CREATE INDEX "kishorkontho_content_issueId_idx" ON "kishorkontho_content"("issueId");

-- CreateIndex
CREATE INDEX "kishorkontho_review_issueId_idx" ON "kishorkontho_review"("issueId");

-- CreateIndex
CREATE INDEX "kishorkontho_review_userId_idx" ON "kishorkontho_review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kishorkontho_review_issueId_userId_key" ON "kishorkontho_review"("issueId", "userId");

-- AddForeignKey
ALTER TABLE "kishorkontho_content" ADD CONSTRAINT "kishorkontho_content_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "kishorkontho_issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kishorkontho_review" ADD CONSTRAINT "kishorkontho_review_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "kishorkontho_issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kishorkontho_review" ADD CONSTRAINT "kishorkontho_review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
