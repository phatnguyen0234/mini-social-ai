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

      if (req.body.receiverId === "AI_Assistant") {
        // Gửi câu hỏi đến API chatbot
        console.log("Gemini API URL:", process.env.GEMINI_API);
        const botResponse = await axios.post(process.env.GEMINI_API, {
          question: req.body.text,
        });

        // Lưu câu trả lời của chatbot vào cơ sở dữ liệu
        const botMessage = new Message({
          conversationId: req.body.conversationId,
          senderId: "AI_Assistant",
          receiverId: req.body.senderId,
          text: botResponse.data.answer,
        });
        await botMessage.save();

        // Tăng số lượng tin nhắn trong conversation
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
      res.status(500).json(err);
    }
  },
};

module.exports = messageController;
