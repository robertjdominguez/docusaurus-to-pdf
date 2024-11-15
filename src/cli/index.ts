import { CliFlags, ConfigOptions } from "../types/cli";
import { SingleBar, Presets } from "cli-progress";
import { ProgressBar } from "../types/cli";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { program } from "../../bin/generate-pdf";

/**
 * Merges CLI flags with config file options. CLI flags take precedence over config file.
 */
export function processFlags(options: CliFlags): ConfigOptions {
  const configPath = findConfigFile("scraper.config.json");
  const configFileOptions = configPath ? loadConfigFile(configPath) : {};

  // Merge CLI options with config file options, CLI flags take precedence
  const config: ConfigOptions = {
    baseUrl: options.baseUrl || configFileOptions?.baseUrl || "",
    entryPoint: options.entryPoint || configFileOptions?.entryPoint || "",
    requiredDirs: options.directories || configFileOptions?.requiredDirs || [],
    customStyles: options.customStyles || configFileOptions?.customStyles || "",
    outputDir:
      options.output || configFileOptions?.outputDir || "./output/docs.pdf",
    forceImages: options.forceImages || configFileOptions?.forceImages || false,
  };

  if (!config.baseUrl) {
    console.error("Error: --baseUrl is required.\n");
    program.outputHelp();
    process.exit(1);
  }

  if (!config.entryPoint) {
    console.error("Error: --entryPoint is required.\n");
    program.outputHelp();
    process.exit(1);
  }

  return config;
}

/**
 * Load and parse the configuration file.
 */
export function loadConfigFile(
  configPath: string,
): Partial<ConfigOptions> | null {
  try {
    const fileContent = readFileSync(configPath, "utf-8");
    console.log(`🎉 Using configuration from: ${configPath}\n\n`);
    return JSON.parse(fileContent) as Partial<ConfigOptions>;
  } catch (error) {
    console.error(`Error loading config file: ${error}`);
    return null;
  }
}

/**
 * Recursively search for a config file starting from the current directory and moving up the tree.
 */
export function findConfigFile(
  filename: string,
  directory = process.cwd(),
): string | null {
  const filePath = join(directory, filename);

  if (existsSync(filePath)) {
    return filePath;
  }

  const parentDirectory = dirname(directory);
  if (parentDirectory === directory) {
    return null;
  }

  return findConfigFile(filename, parentDirectory);
}

/**
 * Creates a single progress bar that allows in-terminal UI updates for sanity.
 */
export function createProgressBar(): ProgressBar {
  const bar = new SingleBar(
    {
      format:
        "{bar} {percentage}% | ETA: {eta}s | {value}/{total} | Processing: {file}",
    },
    Presets.shades_classic,
  );

  let totalItems = 0;
  let processedItems = 0;

  return {
    start(total: number) {
      totalItems = total;
      bar.start(totalItems, 0, { file: "Starting..." });
    },
    update(fileName: string) {
      processedItems += 1;
      bar.update(processedItems, { file: fileName });
    },
    stop() {
      bar.stop();
    },
  };
}
