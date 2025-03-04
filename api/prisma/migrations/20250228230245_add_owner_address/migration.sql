/*
  Warnings:

  - Added the required column `ownerAddress` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Made the column `public_key` on table `Contact` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contact" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "ownerAddress" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "suins" TEXT,
    "name" TEXT
);
INSERT INTO "new_Contact" ("address", "name", "public_key", "suins") SELECT "address", "name", "public_key", "suins" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
CREATE UNIQUE INDEX "Contact_address_ownerAddress_key" ON "Contact"("address", "ownerAddress");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
