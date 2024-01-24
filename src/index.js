require("dotenv").config();

const express = require("express");

const bodyParser = require("body-parser");

const v1GuRoutes = require("./v1/routes/guRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/api/v1", v1GuRoutes);

app.listen(PORT, () => console.log(`gu-calculator is running on port ${PORT}`));
