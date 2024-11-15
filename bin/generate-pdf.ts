#!/usr/bin/env node

import { Command } from "commander";
import { processFlags } from "../src/cli/index";
import { scrapeSidebar } from "../src/sidebar/finder";
import {
  generateAllPdfs,
  mergePDFs,
  savePDF,
} from "../src/generator/pdfGenerartor";
import { CliFlags } from "../src/types/cli";
import { countPdfItems } from "../src/generator/utils";
import { createProgressBar } from "../src/cli/index";

// Define CLI
export const program = new Command();

program
  .option("--all", "Generate PDF for all directories", true)
  .option("--baseUrl <url>", "Base URL of the site")
  .option("--entryPoint <url>", "Entry point for scraping")
  .option("--directories <dirs...>", "Specific directories to include")
  .option(
    "--customStyles <styles...>",
    "Custom styles to override existing CSS",
  )
  .option("--output <path>", "Output PDF path")
  .option("--forceImages", "Disable lazy loading for images");

program.parse(process.argv);

const options: CliFlags = program.opts();

async function run(options: CliFlags) {
  const config = processFlags(options);
  const result = await scrapeSidebar(
    config.entryPoint,
    config.baseUrl,
    config.requiredDirs,
  );

  // Count total PDFs to be generated
  const totalPdfItems = countPdfItems(result);

  // Initialize the progress bar using the factory function
  const progressBar = createProgressBar();
  progressBar.start(totalPdfItems);

  // Generate all PDFs
  const allPdfs = await generateAllPdfs(
    result,
    config.baseUrl,
    progressBar,
    config.customStyles,
    config.forceImages
  );

  const mergedPdf = await mergePDFs(allPdfs);
  savePDF(mergedPdf, config.outputDir);

  // Stop the progress bar when done
  progressBar.stop();
}

run(options);
