-- CreateEnum
CREATE TYPE "AutoRunFrequency" AS ENUM ('MANUAL', 'WEEKLY', 'EVERY_2_DAYS', 'DAILY');

-- CreateEnum
CREATE TYPE "CycleRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "CycleTriggerType" AS ENUM ('AUTO', 'MANUAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CycleAutomationMode" AS ENUM ('MANUAL', 'AUTOMATIC', 'SMART');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'CYCLE_PACK';

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "monthlyCycleLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "cyclesRemaining" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "leadsPerCycle" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN "automationMode" "CycleAutomationMode" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "autoRunFrequency" "AutoRunFrequency" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "cycleRunId" TEXT;

-- CreateTable
CREATE TABLE "CycleRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" "CycleRunStatus" NOT NULL DEFAULT 'QUEUED',
    "triggerType" "CycleTriggerType" NOT NULL DEFAULT 'MANUAL',
    "maxLeads" INTEGER NOT NULL,
    "leadsFound" INTEGER NOT NULL DEFAULT 0,
    "maxRuntimeMs" INTEGER NOT NULL DEFAULT 900000,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "costEstimate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CycleRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CycleRun_userId_status_idx" ON "CycleRun"("userId", "status");

-- CreateIndex
CREATE INDEX "CycleRun_campaignId_createdAt_idx" ON "CycleRun"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_cycleRunId_idx" ON "Lead"("cycleRunId");

-- AddForeignKey
ALTER TABLE "CycleRun" ADD CONSTRAINT "CycleRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleRun" ADD CONSTRAINT "CycleRun_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_cycleRunId_fkey" FOREIGN KEY ("cycleRunId") REFERENCES "CycleRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
