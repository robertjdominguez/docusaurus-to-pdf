import puppeteer, { Browser } from "puppeteer";
import {forceImagesLoading} from "../../src/generator/utils";

describe("check images rendering", () => {
  
  let browser: Browser;

  it("should be able to display every image before passing the page to pdf generator", async () => {
    const docsWithLazyImages = 'https://quickwit.io/docs/get-started/tutorials/tutorial-jaeger';
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(docsWithLazyImages, { waitUntil: "domcontentloaded" });

    // Check if page has unloaded images
    const hasLazyImages = await page.evaluate(() => {
      const images = [...document.querySelectorAll('img')];
      return images.some((img) => !img.complete || img.naturalWidth === 0);
    });

    expect(hasLazyImages).toBe(true);

    // Get html page
    const html = await page.content();

    // Remove loading attribute from img elements
    const pageWithoutLazyImages = forceImagesLoading(html)

    // Refresh page with new html
    await page.setContent(pageWithoutLazyImages)

    // Check if every image is loaded
    const checkLoadedImages = await page.evaluate(() => {
      const images = [...document.querySelectorAll('img')];
      return images.every((img) => img.complete && img.naturalWidth > 0);
    });

    expect(checkLoadedImages).toBe(true);

  });
  afterAll(async () => {
    // Close the browser
    await browser.close();
  });
});