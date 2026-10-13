# Replications of Dahan et al. (2001)

- Dahan, D., Magnuson, J. S., Tanenhaus, M. K., & Hogan, E. M. (2001).
  Subcategorical mismatches and the time course of lexical access: Evidence
  for lexical competition. *Language and Cognitive Processes, 16*, 507–534.
- Dahan, D., Magnuson, J. S., & Tanenhaus, M. K. (2001). Time course of
  frequency effects in spoken-word recognition: Evidence from eye movements.
  *Cognitive Psychology, 42*, 317–367.

Both papers map TRACE activations onto eye-tracking fixations with an explicit
linking hypothesis (Allopenna et al., 1998). Everything here was rebuilt from
the papers alone.

| Example | Paper | What it simulates |
|---|---|---|
| [01-subcategorical-eyetracking](01-subcategorical-eyetracking/) | LCP Fig. 4 | activation and predicted fixations for cross-spliced W1W1, W2W1, N3W1 words |
| [02-subcategorical-lexical-decision](02-subcategorical-lexical-decision/) | LCP pp. 529–530 | lexical decisions when W1 *or* W2 can trigger "yes" (rule reconstructed) |
| [03-frequency-cohorts](03-frequency-cohorts/) | CP Exp. 1, Figs. 5–7 | high- vs low-frequency cohort competitors under four frequency implementations |
| [04-frequency-targets](04-frequency-targets/) | CP Exp. 2, Figs. 9–12 | high- vs low-frequency targets, basic and scaled ("AMT") choice rules |

Each paper's TRACE simulations are all here. The papers' other analyses
(experiments, model–data fits) need the human data, which these examples
don't include.

## Shared pieces (`lib/`)

- **`items.js`** holds the papers' items and the frequency settings.
  - **Transcriptions** are the papers' own TRACE transcriptions, read from
    their appendices. The appendices' IPA-like symbols are mapped to TRACE
    labels: ɒ→a, ʌ→^, ʃ→S, ɹ→r. For example, *net* is /git/, *harp* /lrp/ and
    *children* /Sildr^g/.
  - **Frequencies** are the Kučera–Francis counts the papers list. It also
    builds the lexicons and the frequency configurations, and picks the
    distractors.
- **`linking.py`** holds the linking hypotheses: the basic Luce choice over the
  displayed pictures ("RDL", k = 7), Allopenna et al.'s scaling ("AMT"), and
  the papers' mapping from cycles to 33-ms eye-tracking frames (12.4 ms per
  cycle).

## Reconstruction notes

- **Typos in the appendices.**
  - *cone* is printed /kun/, but TRACE has no /n/; /kud/ is used.
  - *trunk* is printed /tr^^bk/ in one appendix; the other's /tr^bk/ is used.
  - Appendix C's two TRACE columns are headed "HF" and "LF" but list the
    low-frequency word first; the transcriptions are matched to the right words.
- **Lexicons.** The papers added their stimuli to the 235-word lexicon of the
  TRACE distribution, giving 257 words (LCP) and 303 (CP). tsTRACE's default
  lexicon (212 words plus silence) is the one jTRACE ships. With the same
  additions it comes to 239 and 281 entries.
  - Some stimuli are already default words. tsTRACE's /b^t/ (*butt*) is the
    lexicon's very frequent *but*.
  - One "nonword" competitor, /bab/ (for *bat*/*bag*), is a word in this
    lexicon, so for that item N3W1 is really another W2W1.
- **Distractors.** The papers drew unrelated distractors from the lexicon but
  don't list them. They are picked here with a seeded generator, as words that
  begin with a different phoneme. For Experiment 2 of the frequency paper they
  are also limited to frequencies of 10–150.
- **Frequency mechanisms.** tsTRACE implements frequency the way jTRACE does.
  - *Resting levels* match the paper's Eq. 1 once each word's frequency is
    stored as 1 + f (tsTRACE takes log10(c·f), the paper log10(c + f)).
  - *Connection weights* differ. tsTRACE scales phoneme→word input by
    1 + s·log10 f and also scales word→phoneme feedback. The paper's Eq. 4 is
    a′ = a·(1 + a·s·log10(1 + f)), on phoneme→word input only. The engine was
    not changed, so the weight results here use tsTRACE's version.
  - *Post-activation* frequency (Eq. 6) and the AMT scalings (Eqs. 7–8) are
    computed in the plotting scripts.
- **The lexical-decision rule** of the LCP paper is described only in outline
  (details were in an unpublished report). Example 02's rule is a
  reconstruction.

## Run

```
cd 01-subcategorical-eyetracking && node simulate.js && python3 plot.py   # ~3 s
cd ../02-subcategorical-lexical-decision && node simulate.js && python3 plot.py   # ~3 s
cd ../03-frequency-cohorts && node simulate.js && python3 plot.py   # ~4 s
cd ../04-frequency-targets && node simulate.js && python3 plot.py   # ~10 s
```
