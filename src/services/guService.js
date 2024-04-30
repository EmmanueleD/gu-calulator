const xlsx = require("xlsx");
const fs = require("fs");
const https = require("https");
const axios = require("axios");

const getVanilla = () => {
  return "emmanuele ti dice 'ciao!";
};

const getDataFromFile = async (filePath) => {
  if (!filePath) {
    throw new Error("Please provide a file path");
  }

  try {
    const url = decodeURIComponent(filePath);

    const response = await new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = Buffer.from([]);

          res.on("data", (chunk) => {
            data = Buffer.concat([data, chunk]);
          });

          res.on("end", () => {
            resolve(data);
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    const fileContent = Buffer.from(response, "binary");

    const workbook = xlsx.read(fileContent, { type: "buffer" });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const worksheetFromFilePath = sheetData.flat();

    async function getExcelData() {
      const inputArray = worksheetFromFilePath;

      const parsedRows = parseRows(inputArray);

      try {
        let result = await processRows(
          parsedRows,
          transformDateTimeArray,
          calculateTotalHours
        );
        return result;
      } catch (error) {
        throw new Error("Error al procesar el archivo de Excel");
      }
    }

    async function processRows(result, transformFunction, calculateFunction) {
      let currentUserData = [];
      await result.forEach((user) => {
        currentUserData = transformFunction(user.data);
        user.data = currentUserData;
        user.totalHours = calculateFunction(currentUserData);
      });

      return result;
    }

    function parseRows(inputArray) {
      const result = [];

      let currentUser = {};
      let currentUserIndex = 0;

      for (const row of inputArray) {
        if (extractName(row) && extractNumber(row)) {
          currentUser = {
            name: extractName(row),
            fingerId: extractNumber(row),
            data: [],
          };
          result.push(currentUser);
          currentUserIndex = result.length - 1;
        } else if (rowIncludesFormbiddenStrings(row)) {
          continue;
        } else {
          result[currentUserIndex]?.data?.push(row);
        }
      }

      return result;
    }

    function extractName(input) {
      if (typeof input !== "string") {
        return false;
      }

      let pattern = /\b\d+\s*([A-Za-z]+)\s*([A-Za-z]+)\b/; // Matches a number, optional spaces, and then first and last names
      let match = input.match(pattern);

      if (match) {
        let firstName = match[1];
        let lastName = match[2];

        return firstName + " " + lastName;
      } else {
        return false;
      }
    }

    function extractNumber(input) {
      if (typeof input !== "string") {
        return false;
      }

      let pattern = /\b(\d+)\s*[A-Za-z]+\s*[A-Za-z]+\b/; // Matches a number, optional spaces, and then first and last names
      let match = input.match(pattern);

      if (match) {
        let number = match[1];
        return number;
      } else {
        return false;
      }
    }

    function rowIncludesFormbiddenStrings(row) {
      return (
        row.includes("DOMINGO") ||
        row.includes("LUNES") ||
        row.includes("MARTES") ||
        row.includes("MIERCOLES") ||
        row.includes("JUEVES") ||
        row.includes("VIERNES") ||
        row.includes("SABADO") ||
        row.includes("Turno") ||
        row.includes("Dia") ||
        row.includes("Fecha") ||
        row.includes("Entrada") ||
        row.includes("Salida") ||
        row.includes("Total dia") ||
        row.includes("Descanso") ||
        row.includes("Normal") ||
        row.includes("Extra") ||
        row.includes("Legajo") ||
        row.includes("\n")
      );
    }

    function transformDateTimeArray(inputArrays) {
      let fingerPrintEntries = [];

      let currentDate;

      for (let i = 0; i < inputArrays.length; i++) {
        let currentElement = inputArrays[i];

        if (currentElement.includes("Total")) break;

        if (currentElement.includes("/")) {
          let [day, month, year] = currentElement.split("/");
          currentDate = `20${year}-${month}-${day}`;
        }

        if (currentElement.includes(":")) {
          fingerPrintEntries.push(
            (currentDate + "T" + currentElement + ".000-03:00").replace(
              /\s/g,
              ""
            )
          );
        }
      }

      fingerPrintEntries = removeNotFingerPrints(fingerPrintEntries);

      return createWorkshifts(fingerPrintEntries);
    }

    function removeNotFingerPrints(dateArray) {
      let nonFingerPrintsArray = getNonFingerPrints(dateArray);

      const countMap = new Map();
      nonFingerPrintsArray.forEach((element) => {
        countMap.set(element, (countMap.get(element) || 0) + 1);
      });

      const result = dateArray.filter((element) => {
        if (countMap.has(element) && countMap.get(element) > 0) {
          countMap.set(element, countMap.get(element) - 1);
          return false; // Exclude this element
        }
        return true; // Include this element
      });

      return result;
    }

    function getNonFingerPrints(dateArray) {
      const lastVisitedDates = {};
      const result = [];

      dateArray.forEach((date) => {
        const currentDate = date.split("T")[0];

        if (
          lastVisitedDates[currentDate] ||
          lastVisitedDates[currentDate] === 0
        ) {
          result[lastVisitedDates[currentDate]] = date;
        } else {
          lastVisitedDates[currentDate] = result.length;
          result.push(date);
        }
      });

      return result;
    }

    function createWorkshifts(fingerPrintEntries) {
      let workshifts = [];
      let workshiftModel = {
        shift_start: "",
        shift_end: "",
        base_hours: 0,
        extra_hours: 0,
        tot_hours: 0,
        late: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      for (let i = 0; i < fingerPrintEntries.length; i += 2) {
        const shift_start = fingerPrintEntries[i];
        const shift_end = fingerPrintEntries[i + 1];

        const tot_hours = calculateTimeDifferenceInHours(
          shift_start,
          shift_end
        );

        const currentWorkshift = {
          ...workshiftModel,
          shift_start,
          shift_end,
          tot_hours,
          base_hours: tot_hours,
        };

        workshifts.push(currentWorkshift);
      }

      return workshifts;
    }

    function calculateTimeDifferenceInHours(dateStr1, dateStr2) {
      const date1 = new Date(dateStr1);
      const date2 = new Date(dateStr2);

      const timeDifferenceMillis = date2 - date1;

      const timeDifferenceHours = timeDifferenceMillis / (1000 * 60 * 60);

      return timeDifferenceHours;
    }

    function calculateTotalHours(userData) {
      let totalHours = 0;

      for (let i = 0; i < userData.length; i++) {
        totalHours += userData[i].tot_hours;
      }

      return totalHours;
    }

    return await getExcelData();
  } catch (error) {
    throw new Error("Error fetching or processing the file");
  }
};

const fudoAuthUrl = process.env.NODE_FUDO_AUTH_URL;
const fudoApiUrl = process.env.NODE_FUDO_API_URL;
const fudoKey = process.env.NODE_FUDO_KEY;
const fudoSecret = process.env.NODE_FUDO_SECRET;

let token = null;

async function getFudoToken() {
  try {
    const response = await axios.post(
      // `${fudoAuthUrl}`,
      fudoAuthUrl,
      {
        apiKey: fudoKey,
        apiSecret: fudoSecret,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const data = response.data;
    if (response.status === 200) {
      token = data.token;
      return data.token;
    } else {
      throw new Error(data.message || "Failed to get token");
    }
  } catch (error) {
    console.error("Error while obtaining token:", error);
    throw error;
  }
}

async function makeFudoRequest(method, endpoint, body = null) {
  // return { status: 525, message: "NO AUTORIZADO" };
  if (!token) {
    await getFudoToken();
  }

  if (body) {
    body = JSON.parse(body);
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let options = { method, headers };

    if (body) {
      options.data = body;
    }

    const response = await axios(`${fudoApiUrl}/${endpoint}`, options);

    if (response.status >= 200 && response.status < 300) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch Fudo data");
    }
  } catch (error) {
    console.error("Error while fetching data:", error);
    throw error;
  }
}

async function getFudo(endpoint, body = null) {
  return makeFudoRequest("GET", endpoint, body);
}

async function postFudo(endpoint, body = null) {
  return makeFudoRequest("POST", endpoint, body);
}

async function patchFudo(endpoint, body = null) {
  return makeFudoRequest("PATCH", endpoint, body);
}

async function putFudo(endpoint, body = null) {
  return makeFudoRequest("PUT", endpoint, body);
}

async function deleteFudo(endpoint, body = null) {
  return makeFudoRequest("DELETE", endpoint, body);
}

async function getFudoCustomerByAttribute(
  attribute,
  method = "GET",
  body = null
) {
  if (!token) {
    await getFudoToken();
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let options = { method, headers };

    if (body) {
      options.data = body;
    }

    let page = {
      number: 1,
      size: 500,
    };

    let result = [];
    let currentPage = [];

    do {
      currentPage.splice(0);
      let filteredResults = [];
      let res = await axios(
        `${fudoApiUrl}/customers?page[number]=${page.number}&page[size]=${page.size}`,
        options
      );

      currentPage = res.data.data;

      filteredResults = currentPage.filter((customer) => {
        if (!customer.attributes[attribute.key]) {
          return false;
        }

        if (
          customer.attributes[attribute.key]
            .toLowerCase()
            .includes(attribute.value.toLowerCase())
        ) {
          return true;
        }

        return false;
      });

      result = result.concat(filteredResults);

      page.number = page.number + 1;
    } while (currentPage.length > 0);

    return result;
  } catch (error) {
    throw error;
  }
}

async function getCustomers() {
  return await makeFudoRequest("GET", "customers");
}

async function getCustomer(customerId) {
  return await makeFudoRequest("GET", `customers/${customerId}`);
}

async function postCustomer(body) {
  return await makeFudoRequest("POST", "customers", body);
}

async function getUsers() {
  return await makeFudoRequest("GET", "users");
}

async function getUser(userId) {
  return await makeFudoRequest("GET", `users/${userId}`);
}

async function postUser(body) {
  return await makeFudoRequest("POST", "users", body);
}

async function getSalesByPage(page) {
  if (!token) {
    await getFudoToken();
  }
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let options = { method: "GET", headers };

    const response = await axios(
      `${fudoApiUrl}/sales?page[number]=${page}&page[size]=500&sort=-createdAt`,
      options
    );

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch Fudo data");
    }
  } catch (error) {
    console.error("Error while fetching data:", error);
    throw error;
  }
}

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
