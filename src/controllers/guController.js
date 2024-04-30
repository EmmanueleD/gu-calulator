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

const getFudo = async (req, res) => {
  const { endpoint } = req.params;
  try {
    const data = await guService.getFudo(endpoint);
    res.send({ status: "OK ", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const postFudo = async (req, res) => {
  const { endpoint, body } = req.params;
  try {
    const data = await guService.postFudo(endpoint, body);
    res.send({ status: "OK ", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const patchFudo = async (req, res) => {
  const { endpoint, body } = req.params;
  try {
    const data = await guService.patchFudo(endpoint, body);
    res.send({ status: "OK ", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const deleteFudo = async (req, res) => {
  const { endpoint, body } = req.params;
  try {
    const data = await guService.deleteFudo(endpoint, body);
    res.send({ status: "OK ", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const putFudo = async (req, res) => {
  const { endpoint, body } = req.params;
  try {
    const data = await guService.putFudo(endpoint, body);
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

    res.send({ status: "OK EMMD", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const getCustomers = async (req, res) => {
  try {
    const data = await guService.getCustomers();
    res.send({ status: "OK", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const getCustomer = async (req, res) => {
  const { customerId } = req.params;
  try {
    const data = await guService.getCustomer(customerId);
    res.send({ status: "OK", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const postCustomer = async (req, res) => {
  const body = req.body;
  try {
    const data = await guService.postCustomer(body);
    res.send({ status: "OK", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const getUsers = async (req, res) => {
  try {
    const data = await guService.getUsers();
    res.send({ status: "OK", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await guService.getUser(userId);
    res.send({ status: "OK", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const postUser = async (req, res) => {
  const body = req.body;
  try {
    const data = await guService.postUser(body);
    res.send({ status: "OK", data });
  } catch (error) {
    res
      .status(400)
      .send({ status: "FAILED", message: error?.message || error });
  }
};

const getSalesByPage = async (req, res) => {
  const { page } = req.params;

  try {
    const data = await guService.getSalesByPage(page);
    res.send({ status: "OK", data });
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
  getFudo,
  postFudo,
  patchFudo,
  deleteFudo,
  putFudo,
  getFudoCustomerByAttribute,

  getCustomers,
  getCustomer,
  postCustomer,

  getUsers,
  getUser,
  postUser,

  getSalesByPage,
};
