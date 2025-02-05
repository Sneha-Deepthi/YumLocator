const fs = require("fs");
const csv = require("csvtojson");

const csvFilePath = "zomato.csv"; // Your CSV file
const jsonFilePath = "zomato.json"; // Output JSON file

csv()
  .fromFile(csvFilePath)
  .then((jsonArray) => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));
    console.log("CSV converted to JSON successfully!");
  })
  .catch((err) => console.error("Error converting CSV to JSON:", err));
