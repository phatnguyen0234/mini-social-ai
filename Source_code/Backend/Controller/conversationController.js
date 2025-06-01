const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { v4: uuidv4 } = require('uuid');

const conversationController = {
  createConversation: async (req, res) => {
    const newConversation = new Conversation({
      _id: uuidv4(),
      members: [req.body.senderId, req.body.receiverId],
    });
    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  getConversation: async (req, res) => {
    try {
      // Get all conversations for the user
      const conversations = await Conversation.find({
        members: { $in: [req.params.userId] },
      });

      // Get enhanced conversations with last message and other member's info
      const enhancedConversations = await Promise.all(
        conversations.map(async (conv) => {
          // Get last message
          const lastMessage = await Message.findOne({ conversationId: conv._id })
            .sort({ createdAt: -1 })
            .limit(1);

          // Get other member's info
          const otherMemberId = conv.members.find(id => id !== req.params.userId);
          const otherMember = await User.findById(otherMemberId)
            .select("username profilePicture theme");

          return {
            ...conv._doc,
            lastMessage: lastMessage || null,
            otherMember
          };
        })
      );

      res.status(200).json(enhancedConversations);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //GET AVAILABLE CONVERSATION
  getAvailableConversation: async (req, res) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.first, req.params.second] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = conversationController;
