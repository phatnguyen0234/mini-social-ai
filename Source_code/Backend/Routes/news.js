const middlewareController = require("../Controller/middlewareController");
const newsController = require("../Controller/newsController");

const router = require("express").Router();

//GET NEWS
router.get("/", middlewareController.verifyToken, newsController.getHotNews);

module.exports = router;