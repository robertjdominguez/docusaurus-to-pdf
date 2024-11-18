/*
 * This interface defines the structure of the progress bar.
 * `start` initializes the progress bar with the total number of items to process.
 * `update` increments the progress and shows the name of the file being processed.
 * `stop` ends the progress bar once everything is complete.
 */
export interface ProgressBar {
  start(total: number): void;
  update(fileName: string): void;
  stop(): void;
}

/*
 * Represents the command-line flags provided by the user.
 * - `directories`: A list of directories that should be included.
 * - `output`: The file path where the final PDF will be saved.
 * - `baseUrl`: The base URL of the documentation site being scraped.
 * - `entryPoint`: The starting URL for scraping the docs.
 * - `forceImages`: If true it will disable lazy loading for images.
 */
export type CliFlags = {
  directories: string[];
  output: string;
  baseUrl: string;
  entryPoint: string;
  customStyles: string;
  outputDir: string;
  forceImages?: boolean;
};

/*
 * Internal config object derived from CLI flags.
 * - `requiredDirs`: List of directories to process, built from `directories`.
 * - `outputDir`: Path to the output file (same as `output`).
 * - `baseUrl`: The base URL of the site to scrape.
 * - `entryPoint`: Starting point for the scraper (could default to baseUrl + /docs/3.0).
 * - `forceImages`: If true it will disable lazy loading for images.
 */
export type ConfigOptions = {
  requiredDirs: string[];
  outputDir: string;
  baseUrl: string;
  customStyles: string;
  entryPoint: string;
  forceImages?: boolean;
};
