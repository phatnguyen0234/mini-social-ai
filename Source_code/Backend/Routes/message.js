const router = require("express").Router();
const middlewareController = require("../Controller/middlewareController");
const messageController = require("../Controller/messageController");

//CREATE A MESSAGE
router.post(
  "/",
  middlewareController.verifyToken,
  messageController.createMessage
);

//GET MESSAGE
router.get(
  "/:conversationId",
  middlewareController.verifyToken,
  messageController.getMessage
);

//POST API to send to gemini
router.post(
  "/send",
//  middlewareController.verifyToken,
  messageController.sendMessage
);

module.exports = router;


