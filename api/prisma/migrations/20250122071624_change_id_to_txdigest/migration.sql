/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Message` table. All the data in the column will be lost.
  - Added the required column `txDigest` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "txDigest" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sender" TEXT,
    "recipient" TEXT,
    "content" TEXT,
    "timestamp" TEXT
);
INSERT INTO "new_Message" ("id", "sender", "recipient", "content", "timestamp", "txDigest")
SELECT "id", "sender", "recipient", "content", "timestamp", 'temp_' || CAST("id" as TEXT)
FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE TABLE "final_Message" (
    "txDigest" TEXT NOT NULL PRIMARY KEY,
    "sender" TEXT,
    "recipient" TEXT,
    "content" TEXT,
    "timestamp" TEXT
);

-- Copy data to final structure
INSERT INTO "final_Message" ("txDigest", "sender", "recipient", "content", "timestamp")
SELECT "txDigest", "sender", "recipient", "content", "timestamp"
FROM "Message";

-- Drop the intermediate table
DROP TABLE "Message";

-- Rename the final table
ALTER TABLE "final_Message" RENAME TO "Message";

-- Recreate the indexes
CREATE INDEX "Message_recipient_idx" ON "Message"("recipient");
CREATE INDEX "Message_sender_idx" ON "Message"("sender");

PRAGMA foreign_keys=ON;