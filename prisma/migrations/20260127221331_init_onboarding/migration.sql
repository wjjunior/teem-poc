-- CreateTable
CREATE TABLE "OnboardingSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingSectionOwner" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingSectionOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingSectionSubmission" (
    "sectionId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingSectionSubmission_pkey" PRIMARY KEY ("sectionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingSection_key_key" ON "OnboardingSection"("key");

-- CreateIndex
CREATE INDEX "OnboardingSectionOwner_ownerEmail_idx" ON "OnboardingSectionOwner"("ownerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingSectionOwner_sectionId_ownerEmail_key" ON "OnboardingSectionOwner"("sectionId", "ownerEmail");

-- AddForeignKey
ALTER TABLE "OnboardingSectionOwner" ADD CONSTRAINT "OnboardingSectionOwner_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "OnboardingSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingSectionSubmission" ADD CONSTRAINT "OnboardingSectionSubmission_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "OnboardingSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
