import cors from "cors";
import express, { Request, Response, Application } from "express";
import { prisma } from "./db";
import {
  formatPaginatedResponse,
  parsePaginationForQuery,
  parseWhereStatement,
  WhereParam,
  WhereParamTypes,
} from "./utils/api-queries";
import { setActiveAddress, getActiveAddress } from "./utils/activeAddressManager";
import { formatTimestamp } from "./utils/timestampFormatting";

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

    // Fetch all messages involving the current SuiChat user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender: myAddress }, { recipient: myAddress }],
      },
      orderBy: {
        timestamp: "desc", // Order by timestamp descending for easy aggregation
      },
    });

    // contactMap will store info about each contact
    // key = contactAddress, value = { mostRecentMessage, timestamp }
    const contactMap: Record<
      string,
      { mostRecentMessage: string | null; timestamp: string | null }
    > = {};

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

        const contact = await prisma.contact.findUnique({
          where: { address },
          select: { name: true, suins: true },
        });

        return {
          address,
          name: contact?.name || contact?.suins || address, // Use name if available, otherwise suins, otherwise address
          message: mostRecentMessage || "",
          time: timeString, // This will be something like '1:30 PM'
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
    const contacts = await prisma.contact.findMany({
      distinct: ["address"],
      orderBy: {
        address: "asc",
      },
      select: {
        address: true,
        name: true,
        suins: true,
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
  const contact = await prisma.contact.findUnique({
    where: {
      address: addr,
    },
  });

  if (contact && contact.name) {
    res.json(contact.name); // Send the name as JSON
  } else {
    res.json(null); // Send null if no contact is found
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
  const { addr, suiname, contactName } = req.body;

  if (!addr) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        address: addr,
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

app.put("/edit-contact/:addr", async (req, res) => {
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

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`));
