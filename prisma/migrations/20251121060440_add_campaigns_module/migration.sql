-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthPayment" INTEGER NOT NULL,
    "yearPayment" INTEGER NOT NULL,
    "monthCampaign" INTEGER NOT NULL,
    "yearCampaign" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "qualified" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "investmentGoogleAds" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "investmentTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "approvalsRate" DOUBLE PRECISION,
    "goalQualifiedConv" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_projectId_idx" ON "Campaign"("projectId");

-- CreateIndex
CREATE INDEX "Campaign_yearCampaign_monthCampaign_idx" ON "Campaign"("yearCampaign", "monthCampaign");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
