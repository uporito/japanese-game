# Vocabulary data license

The files in `src/data/vocab/` are derived from [OpenJLPT](https://github.com/evanclan/OpenJLPT)
and are distributed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

OpenJLPT itself builds on:

- **JMdict** by the [Electronic Dictionary Research and Development Group](https://www.edrdg.org/) (CC BY-SA 4.0): readings, glosses, parts of speech
- **Jonathan Waller's JLPT lists** ([tanos.co.uk](https://www.tanos.co.uk/jlpt/), CC BY): N5-N3 level assignments

Local changes: example sentences and romaji removed; a short display gloss, a simplified word class,
a kana-only flag and a reading-quiz eligibility flag added (see `scripts/build-vocab.ts`).

JLPT levels are community estimates; the JLPT does not publish official vocabulary lists.
