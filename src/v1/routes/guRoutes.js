const express = require("express");

const guController = require("../../controllers/guController");

const router = express.Router();

router.get("/", guController.getVanilla);

router.get("/api/v1/:filePath", guController.getDataFromFile);

module.exports = router;
