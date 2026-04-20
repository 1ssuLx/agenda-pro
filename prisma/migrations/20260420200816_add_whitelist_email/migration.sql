-- CreateTable
CREATE TABLE "WhitelistEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhitelistEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhitelistEmail_email_key" ON "WhitelistEmail"("email");
