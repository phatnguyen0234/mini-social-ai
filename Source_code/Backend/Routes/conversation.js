const router = require("express").Router();
const middlewareController = require("../Controller/middlewareController");
const conversationController = require("../Controller/conversationController");

//CREATE CONVERSATION
router.post(
  "/",
  middlewareController.verifyToken,
  conversationController.createConversation
);

//GET CONVERSATION OF A USER
router.get(
  "/:userId",
  middlewareController.verifyToken,
  conversationController.getConversation
);

//GET AVAILABLE CONVERSATIONS BETWEEN USERS
router.get(
  "/find/:first/:second",
  middlewareController.verifyToken,
  conversationController.getAvailableConversation
);

module.exports = router;
