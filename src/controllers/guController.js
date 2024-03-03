const guService = require("../services/guService");

const getVanilla = (req, res) => {
  const data = guService.getVanilla();
  res.send({ status: 200, data });
};

const getDataFromFile = async (req, res) => {
  const { filePath } = req.params;

  if (!filePath) {
    res
      .status(400)
      .send({ status: "FAILED", message: "Please provide a file path" });
    return;
  }

  try {
    const data = await guService.getDataFromFile(filePath);
    res.send({ status: "OK ", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const getFudoToken = async (req, res) => {
  try {
    const data = await guService.getFudoToken();
    res.send({ status: "OK ", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const fetchFudo = async (req, res) => {
  const { endpoint, method, body } = JSON.parse(req.body);
  try {
    const data = await guService.fetchFudo(endpoint, method, body);
    res.send({ status: "OK ", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const getFudoCustomerByAttribute = async (req, res) => {
  const { attKey, attVal } = req.params;
  try {
    const data = await guService.getFudoCustomerByAttribute({
      key: attKey,
      value: attVal,
    });

    res.send({ status: "OK ", data: data.data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

module.exports = {
  getVanilla,
  getDataFromFile,
  getFudoToken,
  fetchFudo,
  getFudoCustomerByAttribute,
};
