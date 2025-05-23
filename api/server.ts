import cors from "cors";
import express, { Request, Response, Application } from "express";
import { prisma } from "./db";
import {
	formatPaginatedResponse,
	parsePaginationForQuery,
	parseWhereStatement,
	WhereParam,
	WhereParamTypes,
} from './utils/api-queries';
import { setActiveAddress, getActiveAddress } from './utils/activeAddressManager';
import { formatTimestamp } from './utils/timestampFormatting';
import { WebSocketServer } from "ws"

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  return res.send({ message: "🚀 API is functional 🚀" });
});

// New endpoint to set the active address from the frontend
app.post("/api/setActiveAddress", (req: Request, res: Response) => {
  const { activeAddress: newAddress } = req.body;
  if (!newAddress) {
    return res.status(400).json({ error: "No activeAddress provided" });
  }
  setActiveAddress(newAddress);
  console.log("Active address updated to:", getActiveAddress());
  return res.json({ success: true, getActiveAddress });
});

app.get("/messages", async (req, res) => {
  const myAddress = getActiveAddress();

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender: myAddress }, { recipient: myAddress }],
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const formattedMessages = messages.map((message) => {
      let timeString = "";
      if (message.timestamp) {
        timeString = formatTimestamp(message.timestamp);
      }
      return {
        sender: "sent",
        text: message.content,
        timestamp: timeString,
        txDigest: message.txDigest,
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.get("/messages/by-sender/:sender", async (req, res) => {
  const { sender } = req.params;
  // const sender = getActiveAddress();

  try {
    const messages = await prisma.message.findMany({
      where: {
        sender,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const formattedMessages = messages.map((message) => {
      let timeString = "";
      if (message.timestamp) {
        timeString = formatTimestamp(message.timestamp);
      }

      return {
        sender: "sent",
        text: message.content,
        timestamp: timeString,
        txDigest: message.txDigest,
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.get("/messages/by-recipient/:recipient", async (req, res) => {
  const { recipient } = req.params;
  // const recipient = getActiveAddress()

  try {
    const messages = await prisma.message.findMany({
      where: {
        recipient,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const formattedMessages = messages.map((message) => {
      let timeString = "";
      if (message.timestamp) {
        timeString = formatTimestamp(message.timestamp);
      }

      return {
        sender: "received",
        text: message.content,
        timestamp: timeString,
        txDigest: message.txDigest,
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.get("/messages/with-given-address/:otherAddr", async (req, res) => {
  const myAddress = getActiveAddress();
  const { otherAddr } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender: myAddress, recipient: otherAddr },
          { sender: otherAddr, recipient: myAddress },
        ],
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    const formattedMessages = messages.map((message) => {
      let timeString = "";
      if (message.timestamp) {
        timeString = formatTimestamp(message.timestamp);
      }

      return {
        sender: message.sender === myAddress ? "sent" : "received",
        text: message.content,
        timestamp: timeString,
        txDigest: message.txDigest,
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.get("/contacts", async (req, res) => {
  try {
    const myAddress = getActiveAddress();
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender: myAddress }, { recipient: myAddress }],
      },
    });

    const contactedAddresses = new Set<string | null>();

    messages.forEach((message) => {
      if (message.sender !== myAddress) {
        contactedAddresses.add(message.sender);
      } else if (message.recipient !== myAddress) {
        contactedAddresses.add(message.recipient);
      }
    });

    res.json(Array.from(contactedAddresses));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacted addresses" });
  }
});

app.get("/contacts/metadata", async (req, res) => {
  try {
    const myAddress = getActiveAddress();
    if (!myAddress) {
      return res.status(400).json({ error: "No active wallet address" });
    }

    // Fetch all messages involving the current SuiChat user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender: myAddress }, { recipient: myAddress }],
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const contactMap: Record<string, { mostRecentMessage: string | null; timestamp: string | null }> = {};

    // Build our map with the first (i.e. most recent) message
    messages.forEach((message) => {
      const otherAddress = message.sender === myAddress ? message.recipient : message.sender;
      if (!otherAddress) return;

      // If we haven't seen this address yet, store the most recent message
      if (!contactMap[otherAddress]) {
        contactMap[otherAddress] = {
          mostRecentMessage: message.content,
          timestamp: message.timestamp,
        };
      }
    });

    // Now convert the map to the shape of SidebarConversationParams
    // For now, "name" will be set to the same address string
    const contacts = await Promise.all(
      Object.entries(contactMap).map(async ([address, { mostRecentMessage, timestamp }]) => {
        let timeString = "";
        if (timestamp) {
          timeString = formatTimestamp(timestamp);
        }

        const contact = await prisma.contact.findFirst({
          where: { 
            address,
            ownerAddress: myAddress
          },
          select: { 
            name: true, 
            suins: true,
            public_key: true 
          },
        });

        // Convert hex-formatted public key to Uint8Array
        let publicKey: Uint8Array | null = null;
        if (contact?.public_key) {
          try {

            const keyBuffer = Buffer.from(contact.public_key, 'hex');
            publicKey = Uint8Array.from(keyBuffer);
          } catch (error) {
            console.error(`Failed to convert public key for ${address}:`, error);
          }
        }

        return {
          address,
          name: contact?.name || contact?.suins || address,
          message: mostRecentMessage || "",
          time: timeString,
          publicKey: publicKey ? Array.from(publicKey) : null  // Convert to regular array for JSON serialization
        };
      }),
    );

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.get("/contacts/all-contacts", async (req, res) => {
  try {
    const myAddress = getActiveAddress();
    if (!myAddress) {
      return res.status(400).json({ error: "No active wallet address" });
    }

    const contacts = await prisma.contact.findMany({
      where: {
        ownerAddress: myAddress
      },
      distinct: ["address"],
      orderBy: {
        address: "asc",
      },
      select: {
        address: true,
        name: true,
        suins: true,
        public_key: true,
      },
    });

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.get("/contacts/get-name/:addr", async (req, res) => {
  const { addr } = req.params;
  const ownerAddress = getActiveAddress();
  
  const contact = await prisma.contact.findFirst({
    where: {
      address: addr,
      ownerAddress
    },
  });

  if (contact && contact.name) {
    res.json(contact.name);
  } else {
    res.json(null);
  }
});

app.get("/contacts/get-public-key/:addr", async (req, res) => {
  const { addr } = req.params;
  const ownerAddress = getActiveAddress();
  
  const contact = await prisma.contact.findFirst({
    where: {
      address: addr,
      ownerAddress
    },
  });

  if (contact && contact.public_key) {
    res.json(contact.public_key);
  } else {
    res.json(null);
  }
});

app.get("/contacts/get-suins/:addr", async (req, res) => {
  const { addr } = req.params;
  const contact = await prisma.contact.findUnique({
    where: {
      address: addr,
    },
  });

  if (contact && contact.suins) {
    res.json(contact.suins); // Send the SuiNS as JSON
  } else {
    res.json(null); // Send null if no SuiNS is found
  }
});

app.post("/add-contact", async (req, res) => {
  const { addr, recipientPub, suiname, contactName } = req.body;
  const ownerAddress = getActiveAddress();

  if (!addr) {
    return res.status(400).json({ error: "Address is required" });
  }

  if (!recipientPub) {
    return res.status(400).json({ error: "Public key is required" });
  }

  if (!ownerAddress) {
    return res.status(400).json({ error: "No active wallet address" });
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        address: addr,
        public_key: recipientPub,
        ownerAddress,
        ...(suiname && { suins: suiname }),
        ...(contactName && { name: contactName }),
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add contact" });
  }
});

const wss = new WebSocketServer({ port: 8081 });

app.put('/edit-contact/:addr', async (req, res) => {
    const { addr } = req.params;
    const { suiname, contactName } = req.body;

  try {
    // Check if the contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { address: addr },
    });

    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Update the contact with provided fields
    const updatedContact = await prisma.contact.update({
      where: { address: addr },
      data: {
        ...(suiname && { suins: suiname }),
        ...(contactName && { name: contactName }),
      },
    });

        const broadcastMessage = (data: object) => {
            wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        };

        broadcastMessage({
            type: 'edit-contact',
            contact: {
                address: updatedContact.address,
                suiname: updatedContact.suins,
                contactName: updatedContact.name,
            },
        });

        res.status(200).json(updatedContact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

app.delete('/delete-contact/:addr', async (req, res) => {
  const { addr } = req.params;

  try {
      const contact = await prisma.contact.findUnique({
          where: { address: addr },
      });

      if (!contact) {
          return res.status(404).json({ error: 'Contact not found' });
      }

      await prisma.contact.delete({
          where: { address: addr },
      });

      res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Clear contacts for a wallet
app.delete("/contacts/clear/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  
  try {
    await prisma.contact.deleteMany({
      where: {
        ownerAddress: walletAddress
      }
    });
    
    res.status(200).json({ message: "Contacts cleared successfully" });
  } catch (error) {
    console.error("Error clearing contacts:", error);
    res.status(500).json({ error: "Failed to clear contacts" });
  }
});

app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`));
