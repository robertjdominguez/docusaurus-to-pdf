import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

/**
 * Gets the HTML and CSS links for a particular URL.
 */
export async function getHtml(
  aUrl: string,
): Promise<{ html: string; cssLinks: string[] }> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(aUrl, { waitUntil: "domcontentloaded" });

  // Get the full page content as HTML
  const html = await page.content();

  // Extract the CSS links from the page
  const cssLinks = await page.$$eval('link[rel="stylesheet"]', (links) =>
    links.map((link) => link.href),
  );

  await browser.close();
  return { html, cssLinks };
}

/**
 * Narrows down the HTML to only the div we want from Docusaurus using Cheerio.
 */
export function getThemeDocMarkdown(someHtml: string): string {
  const $ = cheerio.load(someHtml);

  const divContent = $(".theme-doc-markdown").html();

  return divContent ? divContent : "";
}

/**
 * Resolve relative image URLs to absolute URLs.
 */
export function resolveImageUrls(html: string, baseUrl: string): string {
  const $ = cheerio.load(html);

  $("img").each((_, img) => {
    const src = $(img).attr("src");
    if (src && !src.startsWith("http")) {
      // Convert relative URLs to absolute URLs
      const absoluteUrl = new URL(src, baseUrl).href;
      $(img).attr("src", absoluteUrl);
    }
  });

  return $.html();
}

/**
 * Disable lazy loading on images.
 */

export function forceImagesLoading(html: string): string {
  const $ = cheerio.load(html);
  $("img").each((_, img) => {
    // Remove loading attribute for using the default value (eager)
    // Loads the image immediately, regardless of whether or not the image is currently within the visible viewport.
    $(img).removeAttr('loading');
  })

  return $.html()

}

/**
 * Counts PDFs for the progress bar.
 */
export function countPdfItems(items: any[]): number {
  let count = 0;

  function countRecursive(subItems: any[]) {
    for (const item of subItems) {
      count += 1;
      if (item.subItems) {
        countRecursive(item.subItems);
      }
    }
  }

  countRecursive(items);
  return count;
}
