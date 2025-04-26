const router = require("express").Router();
const middlewareController = require("../controller/middlewareController");
const messageController = require("../controller/messageController");

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

module.exports = router;
