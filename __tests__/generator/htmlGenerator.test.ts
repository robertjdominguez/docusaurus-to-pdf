import { getHtml, getThemeDocMarkdown } from "../../src/generator/utils";
import fs from "fs";
import path from "path";

jest.mock("../../src/generator/utils", () => {
  const originalModule = jest.requireActual("../../src/generator/utils");
  return {
    ...originalModule,
    getHtml: jest.fn().mockResolvedValue("<!DOCTYPE html>..."),
  };
});

describe("pdfGenerator", () => {
  it("should be able to get the HTML for a particular URL", async () => {
    const input = "https://hasura.io/docs/3.0/";
    const expectedOutput = "!DOCTYPE";

    // Act
    const result = await getHtml(input);

    // Assert
    expect(result).toContain(expectedOutput);
  });
  it("should be able to parse the theme-doc-markdown div", async () => {
    const sampleHtml = fs.readFileSync(
      path.resolve(__dirname, "sample.html"),
      "utf8",
    );

    const result = getThemeDocMarkdown(sampleHtml);

    expect(result.includes(`<h1>Background</h1>`));
  });
});
