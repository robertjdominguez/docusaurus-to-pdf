import axios from "axios";
import { SidebarObject } from "../types/sidebar";
import * as cheerio from "cheerio";
import { Element } from "domhandler";

/**
 * ATC function that pulls all the sidebar business together.
 */
export async function scrapeSidebar(
  aUrl: string,
  baseUrl: string,
  requiredDirs?: string[],
  localProcessedUrls = new Set<string>(),
): Promise<SidebarObject[]> {
  let sidebarObjectArray: SidebarObject[] = [];

  try {
    const html = await fetchHtml(aUrl);
    const sidebarData = findSidebar(html);

    if (sidebarData) {
      let sidebarElements = sidebarData.toArray();

      sidebarElements = filterSidebarElements(
        sidebarElements,
        requiredDirs ?? [],
      );

      // First pass: Create SidebarObject for every item, add them to processedUrls
      for (const item of sidebarElements) {
        const $ = cheerio.load(item);

        const itemUrl = $(item).attr("href");
        let normalizedUrl = "";
        if (typeof itemUrl === "string") {
          normalizedUrl = normalizeUrl(itemUrl);
        }

        // If the URL has already been processed, skip it
        if (
          typeof itemUrl === "string" &&
          localProcessedUrls.has(normalizedUrl)
        ) {
          continue;
        }

        // Mark the URL as processed
        localProcessedUrls.add(normalizedUrl);

        const hasClass = $(item).hasClass("menu__link--sublist");
        let newItem = createSidebarObject(item);

        if (hasClass) {
          // Mark directories for recursive processing later
          newItem.subItems = [];
        }

        // Push the newly created SidebarObject (either a page or directory)
        sidebarObjectArray.push(newItem);
      }

      // Second pass: Recursively process subdirectories
      for (let newItem of sidebarObjectArray) {
        if (newItem.subItems && typeof newItem.canonicalLink === "string") {
          // Process subdirectory recursively if it exists
          const subItems = await scrapeSidebar(
            `${baseUrl}${newItem.canonicalLink}`,
            baseUrl,
            requiredDirs,
            localProcessedUrls,
          );

          // Assign the recursively fetched subItems to newItem.subItems
          newItem.subItems = subItems;
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to scrape sidebar for URL: ${aUrl}`);
  }

  return sidebarObjectArray;
}

/**
 * Normalizes URLs to deal with our issue around trailing slashes
 */
function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Filters out any directories that aren't required by the user or config.
 */
function filterSidebarElements(
  sidebarElements: Element[],
  directoriesToInclude: string[],
): Element[] {
  if (directoriesToInclude.length === 0) {
    return sidebarElements;
  }

  const filteredElements = sidebarElements.filter((element) => {
    const $ = cheerio.load(element);
    const href = $(element).attr("href");
    return directoriesToInclude.some((dir) => href?.includes(dir));
  });

  return filteredElements;
}

/**
 * For a given menu__link, this creates a SidebarObject
 */
function createSidebarObject(anElement: Element): SidebarObject {
  const $ = cheerio.load(anElement);
  let newObject: SidebarObject = {
    text: $(anElement).text().trimStart(),
    canonicalLink: $(anElement).attr("href"),
    path: $(anElement).attr("href"),
  };

  return newObject;
}

/**
 * Attempts to find the sidebar.
 *
 * If it's there, it returns true. Else, returns false.
 */
function findSidebar(someHtml: string): cheerio.Cheerio<Element> | null {
  const $ = cheerio.load(someHtml);
  const docusaurusMenuLinks = $(".menu__link");

  return docusaurusMenuLinks.length > 0 ? docusaurusMenuLinks : null;
}

/**
 * Fetches the HTML from a given URL.
 */
async function fetchHtml(aUrl: string): Promise<string> {
  try {
    const response = await axios.get(aUrl);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch HTML from ${aUrl}`, error);
    throw error;
  }
}
