const express = require("express");

const guController = require("../../controllers/guController");

const router = express.Router();

router.get("/", guController.getVanilla);

router.get("/api/v1/:filePath", guController.getDataFromFile);

router.get("/api/v1/fudo-api/token", guController.getFudoToken);

router.post(
  "/api/v1/fudo-api/fetch/POST/:endpoint/:body",
  guController.postFudo
);

router.patch(
  "/api/v1/fudo-api/fetch/PATCH/:endpoint/:body",
  guController.patchFudo
);

router.delete(
  "/api/v1/fudo-api/fetch/DELETE/:endpoint/:body",
  guController.deleteFudo
);

router.put("/api/v1/fudo-api/fetch/PUT/:endpoint/:body", guController.putFudo);

router.get("/api/v1/fudo-api/fetch/GET/:endpoint/:body", guController.getFudo);

router.get(
  "/api/v1/fudo-api/customer/attribute/:attKey/:attVal",
  guController.getFudoCustomerByAttribute
);

module.exports = router;
