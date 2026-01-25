-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "category" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "painPoint" TEXT NOT NULL,
    "suggestedMessage" TEXT NOT NULL,
    "dispatchedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QueryHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_website_key" ON "Business"("website");

-- CreateIndex
CREATE UNIQUE INDEX "QueryHistory_location_industry_key" ON "QueryHistory"("location", "industry");
