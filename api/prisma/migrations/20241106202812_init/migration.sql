/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "content" BLOB NOT NULL,
    "timestamp" INTEGER NOT NULL
);
INSERT INTO "new_Message" ("content", "id", "message_id", "recipient", "sender", "timestamp") SELECT "content", "id", "message_id", "recipient", "sender", "timestamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE UNIQUE INDEX "Message_message_id_key" ON "Message"("message_id");
CREATE INDEX "Message_message_id_idx" ON "Message"("message_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
