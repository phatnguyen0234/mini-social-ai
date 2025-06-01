const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => require('uuid').v4()
    },
    members: {
      type: Array,
    },
    messageCount:{
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
