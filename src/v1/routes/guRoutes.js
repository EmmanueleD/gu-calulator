const express = require("express");

const guController = require("../../controllers/guController");

const router = express.Router();

router.get("/", guController.getVanilla);

router.get("/:filePath", guController.getDataFromFile);

module.exports = router;
