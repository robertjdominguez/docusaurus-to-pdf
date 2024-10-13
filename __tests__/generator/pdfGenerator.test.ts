import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import axios from "axios";
import {
  generatePDF,
  mergePDFs,
  savePDF,
  generateAllPdfs,
} from "../../src/generator/pdfGenerartor";
import { SidebarObject } from "../../src/types/sidebar";
import { ProgressBar } from "../../src/types/cli";
import { getHtml, getThemeDocMarkdown } from "../../src/generator/utils";

// Mock HTML content
const sampleHtmlPath = path.join(__dirname, "sample.html");
let sampleHtmlContent: string;

// Progress bar mock
const mockProgressBar: ProgressBar = {
  start: jest.fn(), // Mock implementation of start
  update: jest.fn(), // Mock implementation of update
  stop: jest.fn(), // Mock implementation of stop
};

// Helper function to create a valid PDF buffer
async function createValidPdfBuffer(content: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText(content);
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Mock Puppeteer
jest.mock("puppeteer", () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from("PDF Data")),
      close: jest.fn().mockResolvedValue(undefined),
    }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock fs
jest.mock("fs", () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.requireActual("fs").readFileSync,
}));

// Mock axios for CSS fetching
jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({ data: "mock CSS content" }),
}));

// Mock utils
jest.mock("../../src/generator/utils", () => ({
  getHtml: jest.fn(),
  getThemeDocMarkdown: jest.fn(),
  resolveImageUrls: jest.fn((html: string) => html),
}));

beforeAll(() => {
  sampleHtmlContent = fs.readFileSync(sampleHtmlPath, "utf-8");
});

describe("PDF Functions", () => {
  test("generatePDF should return a PDF buffer", async () => {
    const mockHtml = "<html><body><h1>Sample PDF</h1></body></html>";
    const mockCssLinks = ["https://example.com/styles.css"];
    const baseUrl = "https://example.com";

    const pdfBuffer = await generatePDF({
      html: mockHtml,
      cssLinks: mockCssLinks,
      baseUrl,
    });

    // Validate that a buffer is returned
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);

    // Validate Puppeteer calls
    expect(puppeteer.launch).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(mockCssLinks[0]);
  });

  test("mergePDFs should merge multiple PDF buffers into one", async () => {
    const mockPdfBuffer1 = await createValidPdfBuffer("PDF 1");
    const mockPdfBuffer2 = await createValidPdfBuffer("PDF 2");

    const mergedPdfBuffer = await mergePDFs([mockPdfBuffer1, mockPdfBuffer2]);

    // Assert that the merged PDF buffer is a valid Buffer
    expect(mergedPdfBuffer).toBeInstanceOf(Buffer);
    expect(mergedPdfBuffer.length).toBeGreaterThan(0);

    // You could optionally load the resulting PDF and assert its page count
    const mergedPdfDoc = await PDFDocument.load(mergedPdfBuffer);
    expect(mergedPdfDoc.getPageCount()).toBe(2); // Expecting 2 pages from 2 PDFs
  });

  test("savePDF should save the PDF buffer to the specified file path", () => {
    const mockPdfBuffer = Buffer.from("PDF Data");
    const mockFilePath = "output.pdf";

    savePDF(mockPdfBuffer, mockFilePath);

    // Validate that the PDF was saved
    expect(fs.writeFileSync).toHaveBeenCalledWith(mockFilePath, mockPdfBuffer);
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(mockFilePath), {
      recursive: true,
    });
  });

  test("savePDF should log success when saving PDF", () => {
    const mockPdfBuffer = Buffer.from("PDF Data");
    const mockFilePath = "output.pdf";

    const consoleSpy = jest.spyOn(console, "log");
    savePDF(mockPdfBuffer, mockFilePath);

    expect(consoleSpy).toHaveBeenCalledWith(
      `\n✅ PDF saved at: ${mockFilePath}`,
    );
  });

  test("generateAllPdfs should generate PDFs for all items", async () => {
    const sidebarItems: SidebarObject[] = [
      {
        text: "Item 1",
        canonicalLink: "/item1",
        path: "/item1",
        subItems: [
          {
            text: "Subitem 1",
            canonicalLink: "/item1/subitem1",
            path: "/item1/subitem1",
          },
        ],
      },
      {
        text: "Item 2",
        canonicalLink: "/item2",
        path: "/item2",
      },
    ];

    const baseUrl = "https://example.com";
    const mockHtml = "<html><body><h1>Sample PDF</h1></body></html>";

    (getHtml as jest.Mock).mockResolvedValue({
      html: mockHtml,
      cssLinks: ["https://example.com/styles.css"],
    });
    (getThemeDocMarkdown as jest.Mock).mockReturnValue(mockHtml);

    const pdfBuffers = await generateAllPdfs(
      sidebarItems,
      baseUrl,
      mockProgressBar,
    );

    expect(pdfBuffers).toHaveLength(3);
    expect(mockProgressBar.update).toHaveBeenCalledTimes(3);
  });
});
