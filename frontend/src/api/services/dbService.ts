import { prisma } from '../../../../api/db'
import { getActiveAddress } from '../../../../api/sui-utils'

interface MessageParams {
    id: number;
    sender: string | null;
    recipient: string | null;
    content: string | null;
    timestamp: string | null;
}

async function getAllBySender(senderParam: string): Promise<MessageParams[]> {
    const messagesBySender = await prisma.message.findMany({
        where: {
            sender: senderParam,
        },
    });

    //console.log(messagesBySender);
    return messagesBySender;
}

async function getAllByRecipient(receiverParam: string): Promise<MessageParams[]> {
    const messagesByRecipient = await prisma.message.findMany({
        where: {
            recipient: receiverParam,
        },
    });

    return messagesByRecipient;
}

async function getAllContactedAddresses(): Promise<(string|null)[]> {
    const myAddr = getActiveAddress()
    const allMessages = await prisma.message.findMany({
        where: {
            OR: [
              {
                sender: myAddr,
              },
              {
                recipient: myAddr,
              },
            ]
        }
    });

    // Use a Set to store unique addresses
    const contactedAddresses = new Set<string | null>();

    for (const message of allMessages) {
        if (message.sender !== myAddr) {
            contactedAddresses.add(message.sender);
        } else if (message.recipient !== myAddr) {
            contactedAddresses.add(message.recipient);
        }
    }

    return Array.from(contactedAddresses);
    
}

async function main() {
    // const messages = await getAllBySender("0x1e331d6468eaea0ccd10d3a4a9a9530a0318545c90d0ad9594ddfa27870ff4da")
    // const messages = await getAllByRecipient("0xc5b4d28027c266bf80603617796513f9b7afc0f66957ead0a94b4d78e1b9671f")

    // console.log(messages[0].content)
    const addresses = await getAllContactedAddresses();
    console.log(addresses)
}

main()