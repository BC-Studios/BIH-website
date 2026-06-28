# Readable Article Extractions

This folder contains the working article drafts after the original Pages packages were exported and removed.

## Folders

- `docx/` - Word exports created before the original Pages packages were removed.
- `markdown/` - Markdown text extracted from the Word exports.

## Extraction Method

1. Pages files were exported to Microsoft Word through Apple Pages.
2. Word files were parsed into Markdown using `scripts/docx_to_markdown.py`.
3. Extraction summaries were written to `articles/extraction-audit/`.
4. Original `.pages` packages were deleted from `articles/` to avoid confusion.

## Important Limitation

The exported Word files do not currently contain embedded original article links. The readable Markdown files preserve visible reference text such as researcher names, paper titles, book names, and journal names, but they do not include DOI, PubMed, publisher, or full-text URLs unless those links are added later.

Use the Markdown files for reading and editing. Use the Word exports only as archival/readable exports from the deleted Pages originals.
