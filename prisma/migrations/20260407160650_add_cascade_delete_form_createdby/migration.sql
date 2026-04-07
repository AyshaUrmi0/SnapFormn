-- DropForeignKey
ALTER TABLE "forms" DROP CONSTRAINT "forms_createdById_fkey";

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
