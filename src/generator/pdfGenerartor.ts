import fs from "fs";
import path from "path";
import puppeteer, { Page } from "puppeteer";
import { PDFDocument } from "pdf-lib";
import { SidebarObject } from "../types/sidebar";
import {
  getHtml,
  getThemeDocMarkdown,
  resolveImageUrls,
  forceImagesLoading,
} from "./utils";
import axios from "axios";
import { ProgressBar } from "../types/cli";

/**
 * ATC function that iterates over a SidebarObject[] and prints each item.
 */
export async function generateAllPdfs(
  items: SidebarObject[],
  baseUrl: string,
  progressBar: ProgressBar,
  customStyles?: string,
  forceImages?: boolean
): Promise<Buffer[]> {
  const aggregatePdfs: Buffer[] = [];

  for (const item of items) {
    const newUrl = `${baseUrl}${item.canonicalLink}`;

    const pageHtml = await getHtml(newUrl);
    const pageContent = getThemeDocMarkdown(pageHtml.html);
    const pdf = await generatePDF({
      html: pageContent,
      cssLinks: pageHtml.cssLinks,
      baseUrl,
      customStyles,
      forceImages
    });

    aggregatePdfs.push(pdf);

    // Update the progress bar after generating each PDF
    progressBar.update(newUrl);

    // If subItems exist, recursively call the function and wait for completion
    if (item.subItems) {
      const subItemPdfs = await generateAllPdfs(
        item.subItems,
        baseUrl,
        progressBar,
        customStyles,
        forceImages
      );
      aggregatePdfs.push(...subItemPdfs);
    }
  }

  return aggregatePdfs;
}

/**
 * Launch Puppeteer and open a new page.
 */
async function launchBrowserAndPage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  return { browser, page };
}

/**
 * Wrap the HTML in a full document structure if <head> is missing.
 */
function wrapHtmlIfNeeded(html: string): string {
  if (!html.includes("<head>")) {
    return `<!DOCTYPE html>
      <html>
        <head></head>
        <body>${html}</body>
      </html>`;
  }
  return html;
}

/**
 * Fetch and inject all CSS files into the <head> of the HTML.
 */
async function injectCssLinks(
  html: string,
  cssLinks: string[],
  customStyles?: string,
): Promise<string> {
  for (const link of cssLinks) {
    try {
      const cssResponse = await axios.get(link);
      const styleTag = `<style>${cssResponse.data}</style>`;
      // TODO: If a custom style is passed, we'll inject it here
      const customStyleWrapper = `<style>${customStyles}</style>`;
      html = html.replace(
        "</head>",
        `${styleTag} ${customStyleWrapper}</head>`,
      );
    } catch (err) {
      console.error(`Failed to fetch CSS from ${link}`, err);
    }
  }
  return html;
}

/**
 * Generate a PDF buffer from the HTML content on the Puppeteer page.
 */
async function generatePdfBuffer(page: Page, html: string): Promise<Buffer> {
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "20mm",
      right: "20mm",
    },
  });

  return Buffer.from(pdfBuffer);
}

/**
 * Main function that takes in HTML and CSS links, and returns a PDF buffer.
 */
export async function generatePDF({
  html,
  cssLinks,
  baseUrl,
  customStyles,
  forceImages
}: {
  html: string;
  cssLinks: string[];
  baseUrl: string;
  customStyles?: string;
  forceImages?: boolean;
}): Promise<Buffer> {
  const { browser, page } = await launchBrowserAndPage();

  try {
    html = resolveImageUrls(html, baseUrl);
    html = wrapHtmlIfNeeded(html);
    html = await injectCssLinks(html, cssLinks, customStyles);

    if(forceImages){
      html = forceImagesLoading(html);
    }

    const pdfBuffer = await generatePdfBuffer(page, html);
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

/**
 * Takes in a Buffer[] of PDFs and merges them into a single file.
 */
export async function mergePDFs(aSetOfPDFs: Buffer[]): Promise<Buffer> {
  // Initializing the PDF as an empty document
  const mergedPdf = await PDFDocument.create();

  for (const singlePdf of aSetOfPDFs) {
    const pdfToMerge = await PDFDocument.load(singlePdf);

    const copiedPages = await mergedPdf.copyPages(
      pdfToMerge,
      pdfToMerge.getPageIndices(),
    );

    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  // After it's been aggregated, we're now saving it into a set of bytes
  const serializedPdf = await mergedPdf.save();

  return Buffer.from(serializedPdf);
}

/**
 * Saves a Buffer containing PDF data to a specified file path.
 */
export function savePDF(pdfBuffer: Buffer, filePath: string): void {
  try {
    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(filePath);

    // Write the PDF buffer to the file
    fs.writeFileSync(filePath, pdfBuffer);
    console.log(`\n✅ PDF saved at: ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed to save PDF: ${error}`);
  }
}
