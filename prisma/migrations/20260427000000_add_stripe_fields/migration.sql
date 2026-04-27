-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "plano" TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE "Tenant" ADD COLUMN "trialTerminaEm" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "stripeSubscriptionId" TEXT;
