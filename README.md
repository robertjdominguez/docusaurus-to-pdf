# docusaurus-to-pdf

`docusaurus-to-pdf` is a CLI tool that generates a PDF from a Docusaurus-based documentation website. The tool allows customization of the scraping process via a configuration file or CLI options.

## Installation

You can use `npx` to run the tool without installing it globally:

```bash
npx docusaurus-to-pdf
```

## Usage

By default, the tool looks for a configuration file named `scraper.config.json`. However, you can override this by providing specific options through the CLI.

### CLI Options

- `--all`: Generate PDF for all directories (default: `true`)
- `--baseUrl <url>`: Base URL of the site to scrape
- `--entryPoint <url>`: Entry point for scraping (starting URL)
- `--directories <dirs...>`: Specific directories to include in the scraping process (optional)
- `--customStyles <styles...>`: Add custom styles as a string to override defaults (optional)
- `--output <path>`: Output path for the generated PDF (default: `./output/docs.pdf`)

## Examples

Below, you'll find some example configurations that can be placed in a `scraper.config.json` file.

### Example 1: Scraping specific directories

Only paths which include 'auth' and 'support' will be included in the output:

CLI equivalent: `npx docusaurus-to-pdf --baseUrl https://hasura.io --entryPoint https://hasura.io/docs/3.0 --directories auth support`

```json
{
  "baseUrl": "https://hasura.io",
  "entryPoint": "https://hasura.io/docs/3.0",
  "requiredDirs": ["auth", "support"]
}
```

### Example 2: Scraping all directories

CLI equivalent: `npx docusaurus-to-pdf --baseUrl https://hasura.io --entryPoint https://hasura.io/docs/3.0 --output ./output/all-docs.pdf`

```json
{
  "baseUrl": "https://hasura.io",
  "entryPoint": "https://hasura.io/docs/3.0",
  "outputDir": "./output/all-docs.pdf"
}
```

### Example 3: Scraping without specifying the output directory

CLI equivalent: `npx docusaurus-to-pdf --baseUrl https://docusaurus.io --entryPoint https://docusaurus.io/docs`

```json
{
  "baseUrl": "https://docusaurus.io",
  "entryPoint": "https://docusaurus.io/docs"
}
```

### Example 4: Scraping with custom styles

This will add override the existing styles of tables to have a max-width of `3500px`, which is typical for an A4 sheet
of paper.

CLI equivalent: `npx docusaurus-to-pdf --baseUrl https://hasura.io --entryPoint https://hasura.io/docs/3.0 --directories --customStyles "table { max-width: 3500px !important }"`

```json
{
  "baseUrl": "https://hasura.io",
  "entryPoint": "https://hasura.io/docs/3.0",
  "customStyles": "table { max-width: 3500px !important }"
}
```

## Contributing

We welcome contributions! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Run the tests
5. Commit your changes (`git commit -am 'Add new feature'`).
6. Push to the branch (`git push origin feature-branch`).
7. Create a pull request.
