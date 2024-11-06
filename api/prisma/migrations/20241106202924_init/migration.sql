-- DropIndex
DROP INDEX "Message_message_id_idx";

-- CreateIndex
CREATE INDEX "Message_recipient_idx" ON "Message"("recipient");

-- CreateIndex
CREATE INDEX "Message_sender_idx" ON "Message"("sender");
