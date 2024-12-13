const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Replace with your actual access token and verify token
const ACCESS_TOKEN = "EAAQFe3ZByGZCsBO8Su0pmMELwgRJDbMWn0qrtzlt1r8VQVtRejEU5zFgY92tSnIVlwiunAjSL9KeDg0ZA4hGZCPbzq322WAwhRunZCZCsxGLJGh0MHWEF1evi8DJMkEVDW9KelwmHkS9rJ2s7taJZAZB3TE9ZCcJP8ZCzanaZByQk4S508C5bpF54gxOdNkGoxJQP0Yg4HKBn8mLH6ySskiBLUAKNyZAA37F";
const VERIFY_TOKEN = "abcdef";

// Middleware to parse JSON
app.use(bodyParser.json());

// Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
});

// Handle Incoming Messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  // Check for incoming messages
  if (body.object === "whatsapp_business_account") {
    body.entry.forEach(async (entry) => {
      const changes = entry.changes || [];
      changes.forEach(async (change) => {
        const messages = change.value.messages || [];
        messages.forEach(async (message) => {
          const from = message.from; // Sender's phone number
          const text = message.text?.body || "No text provided"; // Message content

          console.log(`Incoming message from ${from}: ${text}`);

          // Send an automated reply
          await sendMessage(from, `Hello! You said: "${text}". How can we help you?`);
        });
      });
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Function to Send Message
async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/v17.0/1131927888337915/messages`; // Replace with your Phone Number ID

  const payload = {
    messaging_product: "whatsapp",
    to: to,
    text: {
      body: message,
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Message sent to ${to}: ${response.data}`);
  } catch (error) {
    console.error(`Failed to send message to ${to}:`, error.response?.data || error.message);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
