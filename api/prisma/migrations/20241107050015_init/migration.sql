/*
  Warnings:

  - You are about to drop the column `message_id` on the `Message` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sender" TEXT,
    "recipient" TEXT,
    "content" TEXT,
    "timestamp" INTEGER
);
INSERT INTO "new_Message" ("content", "id", "recipient", "sender", "timestamp") SELECT "content", "id", "recipient", "sender", "timestamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_recipient_idx" ON "Message"("recipient");
CREATE INDEX "Message_sender_idx" ON "Message"("sender");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
