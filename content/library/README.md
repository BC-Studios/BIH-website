# Research Library

This folder keeps original research links separate from essay prose, so references can be reused across the full Sansara research section.

## Core Files

- `references.csv` - papers, books, talks, reports, and important web sources.
- `researchers.csv` - recurring scientists and their contributions.
- `timeline.csv` - dated discoveries and experiments across essays.
- `research-notes.csv` - concept-level notes that connect sources, articles, tags, and next actions.
- `cinematic-experiments.csv` - visual, film, and interactive experiment ideas for the website.
- `research-base-map.md` - how the research base connects to articles and public pages.
- `glossary.md` - recurring concepts explained once.

## Source ID Rules

Use stable ids that will not change if the essay title changes.

Good:

- `ulrich-1984-view-window`
- `friston-2010-free-energy`
- `kaplan-1995-restorative-environments`

Avoid:

- `paper1`
- `main-source`
- `architecture-study`

## Link Rules

For each source, keep the most durable link available:

1. DOI link when available.
2. Publisher page.
3. PubMed, arXiv, OSF, university, or lab page.
4. Public PDF only when it appears legitimate.

If a source has both a DOI and a public full-text URL, keep both: put the DOI in `doi` and the full-text page in `url`.

## Summary Rules

The `short_summary` field should answer:

- What did this source test or argue?
- Why does it matter for human state, movement, attention, stress, perception, or environment?
- Which essay section might use it?

Keep summaries short. The essay draft can contain richer interpretation.
