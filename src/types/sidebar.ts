/*
 * Represents an item in the sidebar that will be scraped.
 * - `text`: The display text of the sidebar item.
 * - `canonicalLink`: The canonical URL (could be undefined in some cases).
 * - `path`: The relative path for the item (optional, could be undefined).
 * - `subItems`: Nested sub-items, which are also `SidebarObject`s (optional).
 */
export type SidebarObject = {
  text: string;
  canonicalLink: string | undefined;
  path: string | undefined;
  subItems?: SidebarObject[];
};
