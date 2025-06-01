// const axios = require("axios");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
// import { GoogleGenAI } from "@google/genai";
const GoogleGenAI = require("@google/genai");

const messageController = {
  createMessage: async (req, res) => {
    const newMsg = new Message(req.body);
    try {
      const savedMsg = await newMsg.save();

      if (req.body.receiverId === "gemini_bot") {
        // Send the question to the Gemini API
        //   console.log("Gemini API URL:", process.env.GEMINI_API);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const botResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          //contents: "Hôm nay thời tiết thế nào?",
          contents: req.body.text, // Use the message text as input
          parameters: {
            max_tokens: 100,
            temperature: 0.7,
            top_p: 1,
            n: 1,
            stop: null,
          },
        });


        // Save the chatbot's response to the database
        const botMessage = new Message({
          //  conversationId: req.body.conversationId,
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

  sendMessage: async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const botResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      //contents: "Hôm nay thời tiết thế nào?",
      contents: req.body.text, // Use the message text as input
      parameters: {
        max_tokens: 100,
        temperature: 0.7,
        top_p: 1,
        n: 1,
        stop: null,
      },
    });
    res.status(200).json(botResponse.text);
  },

};



module.exports = messageController;

