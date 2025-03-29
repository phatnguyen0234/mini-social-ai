const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);

// tạo nút ở frontend để hiện thị AI
//tạo 1 AI như 1 user

//createConversation: async (req, res) => {
  //   const newConversation = new Conversation({
  //     members: [req.body.senderId, req.body.receiverId],
  //   });
  //   try {
  //     const savedConversation = await newConversation.save();
  //     res.status(200).json(savedConversation);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },

//   createConversation
// createAIConversation
// const req.body.receiverId = AI_id