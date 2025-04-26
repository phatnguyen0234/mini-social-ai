const axios = require("axios");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const messageController = {
  createMessage: async (req, res) => {
    const newMsg = new Message(req.body);
    try {
      const savedMsg = await newMsg.save();
      await Conversation.findOneAndUpdate(
        {
          _id: req.body.conversationId,
        },
        {
          $inc: { messageCount: 1 },
        }
      );

      if (req.body.receiverId === "gemini_bot") {
        // Send the question to the Gemini API
        console.log("Gemini API URL:", process.env.GEMINI_API);
        const botResponse = await axios.post(
          process.env.GEMINI_API,
          {
            question: req.body.text, // User's question
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GEMINI_API_KEY}`, // Add your API key here
              "Content-Type": "application/json",
            },
          }
        );

        // Save the chatbot's response to the database
        const botMessage = new Message({
          conversationId: req.body.conversationId,
          senderId: "gemini_bot",
          receiverId: req.body.senderId,
          text: botResponse.data.answer, // Adjust based on Gemini's response format
        });
        await botMessage.save();

        // Increment the message count in the conversation
        await Conversation.findOneAndUpdate(
          {
            _id: req.body.conversationId,
          },
          {
            $inc: { messageCount: 1 },
          }
        );
      }

      res.status(200).json(savedMsg);
    } catch (err) {
      console.error("Error creating message:", err);
      res.status(500).json(err);
    }
  },

  getMessage: async (req, res) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      });
      res.status(200).json(messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json(err);
    }
  },
};

module.exports = messageController;