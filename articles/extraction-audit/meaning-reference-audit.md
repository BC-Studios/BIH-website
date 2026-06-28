# Meaning And Reference Audit

## Summary

17 Pages files in `articles/` were exported to `.docx` and converted into readable Markdown.

Outputs:

- Word exports: `articles/readable/docx/`
- Markdown files: `articles/readable/markdown/`
- Export log: `articles/extraction-audit/pages-export.log`
- Conversion audit: `articles/extraction-audit/docx-markdown-audit.csv`
- Source candidates: `content/library/source-candidates.csv`

## Conversion Result

- Pages files exported: 17
- Word exports created: 17
- Markdown files created: 17
- Additional unprocessed Pages files: 0
- Export failures: 0 after filename sanitisation

Two filenames contained colons, which AppleScript treated as path separators during the first export attempt. The exporter now creates safe Word filenames for those files while keeping the source Pages names in the export log.

## Reference Preservation

The conversion preserved visible reference text, but it did not recover embedded source links because no embedded article URLs were found in the Pages archives or exported Word relationships.

Searches found no durable URLs such as:

- DOI links
- PubMed links
- arXiv links
- Publisher links
- Full-text URLs

This means the current drafts name sources, but they do not yet provide a complete source library.

I extracted 30 named source candidates into `content/library/source-candidates.csv`. Each is marked `needs_url` until it has a durable DOI, PubMed, publisher, university, lab, or book link.

## Canonical Article Audit

| # | Article | Markdown file | Word count | Status | Main issue |
| --- | --- | --- | --- | --- | --- |
| 1 | The Neuroscience of Environmental Architecture | `the-neuroscience-of-environmental-architecture-the-neuroscience-of-environmental-architecture.md` | 1142 | Complete draft | Needs original source links and Open Questions |
| 2 | Can Light Become a Performance Variable? | `can-light-become-a-performance-variable.md` | 1151 | Complete draft | Needs original source links and Open Questions |
| 3 | Why Rhythm Is Infrastructure, Not Entertainment? | `why-rhythm-is-one-of-the-brain-s-oldest-technologies.md` | 3440 | Complete draft | Expanded flagship structure; verify source links before publication |
| 4 | The Predictive Brain Meets the Yoga Studio | `the-predictive-brain-meets-the-yoga-studio.md` | 979 | Complete draft | Needs original source links |
| 5 | The Missing Variable in Modern Wellness: Sensory Coherence | `the-missing-variable-in-modern-wellness.md` | 1424 | Complete draft | Needs public title confirmation and original source links |
| 6 | Engineering Collective Flow | `engineering-flow-why-the-future-of-wellness-is-state-design.md` | 340 | Needs depth | Too short for full collective-flow article |
| 7 | From Exercise Prescription to State Engineering | `from-exercise-prescription-to-state-engineering.md` | 1165 | Complete draft | Needs original source links |
| 8 | What Elite Athletes Can Teach Yoga Teachers | `what-elite-athletes-can-teach-yoga-teachers.md` | 1068 | Complete draft | Needs original source links |
| 9 | Can We Measure Flow Like We Measure Heart Rate? | `can-we-measure-flow-like-we-measure-heart-rate.md` | 1144 | Complete draft | Needs original source links and Open Questions |
| 10 | The Next Generation of Human Performance Will Be Environmental | `the-next-generation-of-human-performance-will-be-environmental.md` | 1064 | Complete draft | Needs original source links |

## Additional Drafts

| Draft | Word count | Possible use |
| --- | --- | --- |
| `beyond-homeostasis.md` | 1082 | Supporting essay for allostasis, prediction, recovery, and Article 4 / Article 7 |
| `can-technolgy-become-invisible.md` | 913 | Additional essay or technology-design source material |
| `the-neuroscience-of-awe.md` | 1021 | Additional essay or source material for awe, environment, and experience design |
| `the-next-generation-of-human-performance-designing-states-not-workouts.md` | 710 | Earlier synthesis overlapping Article 7 and Article 10 |
| `the-next-performance-revolution-won-t-happen-inside-you.md` | 1011 | Earlier manifesto overlapping Article 10 |
| `when-teaching-replaces-practice.md` | 871 | Additional teacher-workflow essay; relevant to technology, teacher attention, and practice design |
| `why-beauty-matters.md` | 1149 | Strong source material for Article 5, but not yet `Sensory Coherence` |

## Meaning Preservation Notes

The Markdown conversions preserve the article text in reading order from the Word exports. They are suitable for editorial review and deeper rewriting.

Known limitations:

- Some visual formatting from Pages is not preserved.
- Some heading hierarchy may need manual cleanup, especially in `the-next-generation-of-human-performance-designing-states-not-workouts.md`.
- Hyperlinks are absent because original embedded links were not present in the source files.
- The reference sections are bibliographic notes, not verified source-library entries yet.

## Next Editorial Work

1. Add durable source links for every cited paper, book, researcher page, and landmark experiment.
2. Expand Article 6 into a full research essay.
3. Confirm whether Article 5 should publish with the shorter title or the full `Sensory Coherence` title.
4. Add `Open Questions` to the issue essays that do not yet end that way.
5. Convert named references into structured source IDs in `content/library/references.csv`.
