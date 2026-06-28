# Research Base Map

The research base is separate from polished article prose. It stores the evidence, chronology, recurring concepts, and experiment ideas that the website can reuse across the full journal.

## Files

| File | Purpose |
| --- | --- |
| `source-candidates.csv` | Pre-verification source list gathered from article drafts. |
| `references.csv` | Verified source library with stable ids, URLs, DOI links, and short summaries. |
| `researchers.csv` | Recurring scientists, fields, and key contributions. |
| `timeline.csv` | Chronological lineage of discoveries, theories, and experiments used across the articles. |
| `research-notes.csv` | Concept-level research notes that connect sources to articles, tags, and next actions. |
| `cinematic-experiments.csv` | Website, film, and interactive experiment ideas that translate research themes into visual experiences. |
| `glossary.md` | Stable definitions for recurring Sansara concepts and scientific terms. |
| `../../articles/sensory-map.csv` | Editorial sensory ontology connecting public tags to sensory dimensions, linked systems, state outcomes, and article bridges. |

## Relationship To Articles

Articles should reference the base instead of duplicating everything.

- Source cards should come from `references.csv`.
- Research lineage modules should come from `timeline.csv`.
- Concept pages should draw from `research-notes.csv`.
- Sensory map modules should draw from `articles/sensory-map.csv`.
- Website visual ideas should draw from `cinematic-experiments.csv`.
- Public tag pages should combine `article-tags.csv`, `articles/sensory-map.csv`, `research-notes.csv`, and `cinematic-experiments.csv`.

## Publication Rule

The base can be public later, but it should remain editorially distinct from the essays:

- Articles are the narrative.
- The base is the evidence system.
- Cinematic experiments are translation devices, not scientific proof.

## Verification Rule

Rows seeded from current drafts are useful for structure but not final citation work. Before publication, move sources from `source-candidates.csv` into `references.csv` only after adding durable links, DOI/publisher/PubMed pages, and a short factual summary.
