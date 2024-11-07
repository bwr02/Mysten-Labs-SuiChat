-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sender" TEXT,
    "recipient" TEXT,
    "message_id" TEXT NOT NULL,
    "content" TEXT,
    "timestamp" INTEGER
);
INSERT INTO "new_Message" ("content", "id", "message_id", "recipient", "sender", "timestamp") SELECT "content", "id", "message_id", "recipient", "sender", "timestamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE UNIQUE INDEX "Message_message_id_key" ON "Message"("message_id");
CREATE INDEX "Message_recipient_idx" ON "Message"("recipient");
CREATE INDEX "Message_sender_idx" ON "Message"("sender");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
