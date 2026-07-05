-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('VIVA_HELP', 'EXAM_HELP', 'GENERAL_SUPPORT');

-- CreateTable
CREATE TABLE "support_conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT,
    "type" "ConversationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_conversation_adminId_updatedAt_idx" ON "support_conversation"("adminId", "updatedAt");

-- CreateIndex
CREATE INDEX "support_conversation_type_idx" ON "support_conversation"("type");

-- CreateIndex
CREATE INDEX "support_conversation_updatedAt_idx" ON "support_conversation"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "support_conversation_userId_type_key" ON "support_conversation"("userId", "type");

-- CreateIndex
CREATE INDEX "support_message_conversationId_createdAt_idx" ON "support_message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "support_message_conversationId_isSeen_idx" ON "support_message"("conversationId", "isSeen");

-- CreateIndex
CREATE INDEX "support_message_senderId_idx" ON "support_message"("senderId");

-- AddForeignKey
ALTER TABLE "support_conversation" ADD CONSTRAINT "support_conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_conversation" ADD CONSTRAINT "support_conversation_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "support_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
