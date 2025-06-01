const router = require("express").Router();
const middlewareController = require("../Controller/middlewareController");
const userController = require("../Controller/userController");
//const { createBot } = require("../controller/userController");


//UPDATE A USER
router.put(
  "/:id",
  middlewareController.verifyTokenAndUserAuthorization,
  userController.updateUser
);

//DELETE A USER
router.delete(
  "/:id",
  middlewareController.verifyTokenAndUserAuthorization,
  userController.deleteUser
);

//GET A USER
router.get("/:id", middlewareController.verifyToken, userController.getUser);

//GET LEADER BOARD USERS
router.get(
  "/:id/leaderboard",
  middlewareController.verifyToken,
  userController.getLeaderboard
);

//FOLLOW A USER
router.put(
  "/:id/follow",
  middlewareController.verifyToken,
  userController.followUser
);

//SEARCH FOR USERS
router.get("/", middlewareController.verifyToken, userController.searchAllUser);


router.get("/test", (req, res) => {
  res.send("User router OK");
});


module.exports = router;