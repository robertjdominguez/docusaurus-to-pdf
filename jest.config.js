module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__", "<rootDir>/src", "<rootDir>/bin"],
  watchPathIgnorePatterns: ["<rootDir>/dist/"],
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/?(*.)+(test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};
