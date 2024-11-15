import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import {
  getHtml,
  getThemeDocMarkdown,
  resolveImageUrls,
  countPdfItems,
  forceImagesLoading,
} from "../../src/generator/utils";

// Mock Puppeteer
jest.mock("puppeteer", () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn().mockResolvedValue(undefined),
      content: jest
        .fn()
        .mockResolvedValue("<html><body><h1>Test Page</h1></body></html>"),
      $$eval: jest
        .fn()
        .mockResolvedValue([
          "https://example.com/style1.css",
          "https://example.com/style2.css",
        ]),
      close: jest.fn().mockResolvedValue(undefined),
    }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe("Utils", () => {
  describe("getHtml", () => {
    test("should return HTML and CSS links for a given URL", async () => {
      const url = "https://example.com";

      const result = await getHtml(url);

      // Assert that HTML and CSS links are returned
      expect(result.html).toContain("<h1>Test Page</h1>");
      expect(result.cssLinks).toEqual([
        "https://example.com/style1.css",
        "https://example.com/style2.css",
      ]);

      // Validate Puppeteer calls
      expect(puppeteer.launch).toHaveBeenCalled();
    });
  });

  describe("getThemeDocMarkdown", () => {
    test("should extract the content of .theme-doc-markdown div", () => {
      const sampleHtml = `
        <html>
          <body>
            <div class="theme-doc-markdown">
              <p>Markdown content</p>
            </div>
          </body>
        </html>
      `;

      const result = getThemeDocMarkdown(sampleHtml);

      // Assert that the correct HTML is extracted
      expect(result).toContain("Markdown content");
    });

    test("should return an empty string if .theme-doc-markdown is not found", () => {
      const sampleHtml = "<html><body>No markdown here</body></html>";

      const result = getThemeDocMarkdown(sampleHtml);

      // Assert that an empty string is returned
      expect(result).toBe("");
    });
  });

  describe("resolveImageUrls", () => {
    test("should resolve relative image URLs to absolute URLs", () => {
      const sampleHtml = `
        <html>
          <body>
            <img src="/images/example.jpg" />
            <img src="https://example.com/images/absolute.jpg" />
          </body>
        </html>
      `;
      const baseUrl = "https://example.com";

      const result = resolveImageUrls(sampleHtml, baseUrl);

      // Assert that relative URLs are converted to absolute
      expect(result).toContain('src="https://example.com/images/example.jpg"');
      expect(result).toContain('src="https://example.com/images/absolute.jpg"');
    });

    test("should leave absolute image URLs unchanged", () => {
      const sampleHtml = `
        <html>
          <body>
            <img src="https://example.com/images/absolute.jpg" />
          </body>
        </html>
      `;
      const baseUrl = "https://example.com";

      const result = resolveImageUrls(sampleHtml, baseUrl);

      // Assert that absolute URLs are not modified
      expect(result).toContain('src="https://example.com/images/absolute.jpg"');
    });
  });

  describe("forceImagesLoading", () => {
    test("should remove loading attribute from img elements", () => {
      const sampleHtml = `
        <html>
          <body>
            <img loading='lazy' src="/images/example.jpg" />
            <img loading='lazy' src="https://example.com/images/absolute.jpg" />
          </body>
        </html>
      `;

      const result = forceImagesLoading(sampleHtml);

      // Assert that relative URLs are converted to absolute
      expect(result).not.toContain('loading="lazy"');
    });
  });

  describe("countPdfItems", () => {
    test("should correctly count the number of PDF items including subItems", () => {
      const sidebarItems = [
        {
          text: "Item 1",
          subItems: [
            { text: "Subitem 1" },
            { text: "Subitem 2", subItems: [{ text: "Subsubitem 1" }] },
          ],
        },
        { text: "Item 2" },
      ];

      const count = countPdfItems(sidebarItems);

      // Assert that all items including subItems are counted
      expect(count).toBe(5); // 1 + 2 subItems + 1 subsubitem + 1 = 5
    });

    test("should return 0 if there are no items", () => {
      const sidebarItems: any[] = [];

      const count = countPdfItems(sidebarItems);

      // Assert that count is 0 for empty input
      expect(count).toBe(0);
    });
  });
});
