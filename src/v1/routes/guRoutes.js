const express = require("express");

const guController = require("../../controllers/guController");

const router = express.Router();

router.get("/", guController.getVanilla);

router.get("/api/v1/:filePath", guController.getDataFromFile);

router.get("/api/v1/fudo-api/token", guController.getFudoToken);

router.post(
  "/api/v1/fudo-api/fetch/:method/:endpoint/:body",
  guController.fetchFudo
);

router.get(
  "/api/v1/fudo-api/customer/attribute/:attKey/:attVal",
  guController.getFudoCustomerByAttribute
);

module.exports = router;
