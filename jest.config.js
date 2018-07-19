const fs = require("fs");
const path = require("path");
module.exports = {
  projects: fs.readdirSync("tests").map(entry => ({
    displayName: entry,
    rootDir: path.join("tests", entry),
    transform: {
      "\\.ts$": "ts-jest"
    },
    resolver: "../../",
    ...require(path.join(__dirname, "tests", entry, "jest.config.js"))
  }))
};
