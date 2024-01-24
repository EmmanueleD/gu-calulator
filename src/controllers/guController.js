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

module.exports = {
  getVanilla,
  getDataFromFile,
};
