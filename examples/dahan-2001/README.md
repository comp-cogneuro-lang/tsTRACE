# Replications of Dahan et al. (2001)

- Dahan, D., Magnuson, J. S., Tanenhaus, M. K., & Hogan, E. M. (2001).
  Subcategorical mismatches and the time course of lexical access: Evidence
  for lexical competition. *Language and Cognitive Processes, 16*, 507–534.
- Dahan, D., Magnuson, J. S., & Tanenhaus, M. K. (2001). Time course of
  frequency effects in spoken-word recognition: Evidence from eye movements.
  *Cognitive Psychology, 42*, 317–367.

Both papers map TRACE activations onto eye-tracking fixations with an explicit
linking hypothesis (Allopenna et al., 1998). The examples were first rebuilt
from the papers. The subcategorical-mismatch examples (01, 02) were then
aligned with the original simulation archive, `SubCatSims_2k0325` (March
2000, final version "Try3"); see "What the original code settled" below.

| Example | Paper | What it simulates |
|---|---|---|
| [01-subcategorical-eyetracking](01-subcategorical-eyetracking/) | LCP Fig. 4 | activation and predicted fixations for cross-spliced W1W1, W2W1, N3W1 words |
| [02-subcategorical-lexical-decision](02-subcategorical-lexical-decision/) | LCP pp. 529–530 | lexical decisions when W1 *or* W2 can trigger "yes" (rule reconstructed) |
| [03-frequency-cohorts](03-frequency-cohorts/) | CP Exp. 1, Figs. 5–7 | high- vs low-frequency cohort competitors under four frequency implementations |
| [04-frequency-targets](04-frequency-targets/) | CP Exp. 2, Figs. 9–12 | high- vs low-frequency targets, basic and scaled ("AMT") choice rules |

Each paper's TRACE simulations are all here. The papers' other analyses
(experiments, model–data fits) need the human data, which these examples
don't include.

## Shared pieces

- **`lib/items.js`** holds the papers' items and the model settings.
  - **Transcriptions** are the papers' own TRACE transcriptions, read from
    their appendices and checked against the archived simulation files. The
    appendices' IPA-like symbols are mapped to TRACE labels: ɒ→a, ʌ→^, ʃ→S,
    ɹ→r. For example, *net* is /git/, *harp* /lrp/ and *children* /Sildr^g/.
  - **Subcategorical items** come with the archived displays: the two
    unrelated distractors and the cohort-absent competitor (e.g. *nurse* for
    *net*).
  - **`subcatConfig()`** builds the subcategorical configurations (`archive`
    and `me86`) and their 263-word lexicon.
  - **Frequencies** are the Kučera–Francis counts the papers list. The file
    also builds the frequency lexicons and configurations, and picks the
    frequency examples' distractors.
- **`lib/linking.py`** holds the linking hypotheses:
  - the basic Luce choice over the displayed pictures ("RDL", k = 7);
  - Allopenna et al.'s scaling ("AMT"), with activations shifted so that rest
    counts as 0, as in the archived scripts;
  - the papers' mapping from cycles to 33-ms eye-tracking frames (12.4 ms per
    cycle).
- **`items/distribution-lexicon.txt`** is the 235-word lexicon of the Unix
  distribution of TRACE, copied unchanged from the archive
  (`phonolex_orig_trace`).
- **`items/distribution-phonemes.json`** holds that distribution's phoneme
  features and per-dimension spreads, extracted from the archive's
  `ofetvals.c`.

## Reconstruction notes

- **Typos in the appendices.**
  - *carp*, *cart* and *cark* are printed /kup/, /kut/, /kuk/ in the
    subcategorical paper. The archived simulation files use /krp/, /krt/,
    /krk/, like *fort* /srt/ and *harp* /lrp/, and so do these examples.
  - *cone* is printed /kun/, but TRACE has no /n/; /kud/ is used.
  - *trunk* is printed /tr^^bk/ in one appendix; the other's /tr^bk/ is used.
  - Appendix C's two TRACE columns are headed "HF" and "LF" but list the
    low-frequency word first; the transcriptions are matched to the right words.
- **Subcategorical lexicon** (01, 02). It is built as in the archive: the
  235-word distribution lexicon without /bab/, /babi/ and /bat^l/ (so that
  *bab*, the nonword competitor of *bat*, is not a word), plus every W1, W2 and
  cohort-absent competitor. That gives 263 words; the paper reports 257.
- **Frequency lexicons** (03, 04). As in the paper, they are the 235-word
  distribution lexicon, with its frequencies, plus the 68 stimuli. The
  distribution file lists five words twice (*gal*, *gard*, *gat*, *glu*,
  *grit*); kept once, that gives 298 words, the paper's 303 less the
  duplicates.
  - jTRACE's `slex_dahan2001` is built the same way (it keeps the duplicates).
    But it has older transcriptions for some stimuli: *bench*, *bed* and
    *bell* as /b^bS/, /b^d/, /b^l/ (the paper says it changed them to /bibS/,
    /bid/, /bil/), *trumpet* /tr^bp^t/, *snail* /sp^l/. The examples use the
    published ones.
  - Words with frequency 0 count as 1, as the paper says.
  - *picture* is listed at 227 in Appendix A and 277 in Appendix C; 277 is
    used for both experiments.
  - /b^t/ (*butt*) is the lexicon's very frequent *but*.
- **Distractors.** The subcategorical examples use the archived displays.
  Experiment 1's distractors come from jTRACE's template for this simulation
  (`templates/freq-eye-track.jt`), one per display. Experiment 2's are picked
  from the distribution lexicon with a seeded generator: words that begin with
  a different phoneme, with frequencies of 10–150.
- **Frequency mechanisms.** tsTRACE implements frequency the way jTRACE does.
  - *Resting levels* match the paper's Eq. 1 once each word's frequency is
    stored as 1 + f (tsTRACE takes log10(c·f), the paper log10(c + f)).
  - *Connection weights* differ. tsTRACE scales phoneme→word input by
    1 + s·log10 f and also scales word→phoneme feedback. The paper's Eq. 4 is
    a′ = a·(1 + a·s·log10(1 + f)), on phoneme→word input only. The archived
    C code is different again (see below). The engine was not changed, so the
    weight results here use tsTRACE's version.
  - That is probably the version the paper's results came from. jTRACE first
    implemented Eq. 4, then switched to this form, quoting the original C line
    ("Jim's code"). With it, jTRACE's replication matched the paper's Fig. 6
    with an RMS error of about 0.01 for all three methods (Strauss, Harris &
    Magnuson, 2007, *Behavior Research Methods*).
  - *Post-activation* frequency (Eq. 6) and the AMT scalings (Eqs. 7–8) are
    computed in the plotting scripts.
- **The lexical-decision rule** of the subcategorical paper is described only
  in outline, and the archive has no lexical-decision code. Example 02's rule
  is a reconstruction.

## What the original code settled

The archive holds two versions, `Try2` (to March 22, 2000) and `Try3` (to
March 25). `Try3` is the later one: it adds the /krp/, /lrp/ and /srt/ items
and raises phoneme inhibition to 0.05.

**The pipeline.**

- **Inputs.** The C program wrote each word's feature input to a file
  (`test word`, then `sfeatures`; 99 slices × 7 dimensions).
  `XspliceSfeats_1.pl -splice=24` then joined the first token's slices 0–23 to
  W1's slices from 24 on. Strictly, the first dimension's row of slice 24 also
  came from the first token, but that row (Power) is the same for every final
  stop.
  - tsTRACE's final-consonant splice (`{k9t}`) produces exactly this input.
- **Lexicon.** The final runs (`Try3`) used `phonolex_subcat_3small`: only the
  44 stimulus words plus silence. A full-lexicon variant
  (`CreateSubcatSrcs.src.FULL_LEX`) used `phonolex_subcat_1`/`_2frq` (255 and
  265 entries). Those were built from the 235-word distribution lexicon with
  /bab/, /babi/ and /bat^l/ removed.
  - The paper describes a 257-word lexicon in which all words compete. The
    examples follow it in spirit, using the full-lexicon construction, which
    also matches the paper's figure better (see 01).
- **Parameters.** No parameter file was loaded; the program's compiled
  defaults were:
  - word-to-phoneme excitation 0.015 (M&E: 0.03);
  - phoneme inhibition 0.05 in `Try3` (M&E: 0.04);
  - otherwise M&E's values;
  - the *distribution* phoneme set (`ofetvals.c`), whose features spread 3, 6,
    9, 9, 9, 3 and 9 slices by dimension. The input files confirm these
    spreads.
  - The paper says it used "the standard parameter set reported in McClelland
    and Elman (1986)". Its footnote 4 mentions the distribution's different
    spreads, and footnote 5 says the pattern holds for three parameter sets.
    Example 01 runs both the archived and the M&E settings.
- **Run.** 100 cycles, with frequency off.
- **Readout.** Activations were printed ×100 as integers, for word alignments
  at slices 0–66 in steps of 3.
  - *Copy:* each word was read at the alignment where it peaked over the run (a
    post-hoc max copy).
  - *Choice rule:* a plain Luce rule, exp(k·a), over the four displayed words
    with k = 7, and over the whole lexicon with k = 15.
  - *No scaling or delay:* the Allopenna scaling factor is computed in the
    code but commented out, and no saccade delay is added.
  - *Downsampling* (`ds`) was 2 cycles.
- **Displays.** Each set has two: with the cohort (W1, W2, two distractors)
  and without it (W1, the cohort-absent competitor W2b, the same distractors).
  The paper's Fig. 4 is the cohort-present display.
  - The small-lexicon runs drew the distractors from other stimuli (e.g.
    /sis/, /rid/).
  - The full-lexicon variant drew them from other lexicon words (e.g. /gis/,
    /lup/, /par/, /b^s/). The examples use the full-lexicon variant's
    distractors, with the `Try3` transcriptions.
- **No surviving outputs.** The per-item output files for the final runs were
  not kept; `HOLDwrd/` holds empty headers, and the summary files are from an
  earlier 7-item run.

**A bug in the archived C code.** In the phoneme→word loop of `interact.c`
(added 2000-01-23, for frequency in connection weights), the line is:

```c
*wnexptr++ += (wp->wfrq * *wtptr++*t) + (*wtptr++*t);
```

- **What it does.** It advances the weight pointer twice for every word slot
  it updates. With frequency off (`wfrq` = 0) and left-to-right evaluation, a
  phoneme feeds each word over one slot, the slot before its peak, with a
  single weight. The correct code feeds three slots, centered on the peak,
  with weights in proportion 0.75, 1, 0.75.
- **The result.** Bottom-up word input falls to 40% and shifts one phoneme slot
  early.
- **Compiler dependence.** The order of the two increments is undefined in C,
  so the result depended on the compiler.

**C TRACE against tsTRACE.** The archived source was compiled in two versions:
as written (with clang, which evaluates left to right), and with that line
corrected to one weight per slot. Both were run on the archived *net* inputs
with the archived settings and the 45-word lexicon.
- **tsTRACE matches the corrected program** to within 0.012 at every word unit
  and cycle (the C output is rounded to 0.01).
- **The archived build differs** by up to 0.71 per unit, because its words peak
  one slot early.
- **Averaged over the 15 items, the conditions come out in the same order in
  both builds:**
  - full lexicon, as-written build: W2 peaks at 0.151, 0.169 and 0.283
    (W1W1, N3W1, W2W1);
  - corrected build: 0.145, 0.159 and 0.255;
  - the paper's figure: about 0.15, 0.165 and 0.23.

**Comparison with the published Fig. 4.** The figure's curves start at 0.25,
which confirms the unscaled readout. With the archived parameters and the
full lexicon, the competitor's peaks for W1W1 and N3W1 match the figure to
within 0.002 and one cycle. Two parts of the published figure aren't
reproduced by any combination of build, lexicon, parameters or displays tried:
- the target sagging after cycle 70;
- target fixations ending near 0.90.

The figure probably came from a later run than this archive.

**For the frequency paper**, the archive settles the AMT details: activations
shifted by +0.30 before Eq. 7, and probabilities (not strengths) scaled. It
does not settle the connection-weight formula, which the bug above makes
compiler-dependent (see [03](03-frequency-cohorts/)).

## Run

```
cd 01-subcategorical-eyetracking && node simulate.js && python3 plot.py   # ~6 s
cd ../02-subcategorical-lexical-decision && node simulate.js && python3 plot.py   # ~6 s
cd ../03-frequency-cohorts && node simulate.js && python3 plot.py   # ~4 s
cd ../04-frequency-targets && node simulate.js && python3 plot.py   # ~10 s
```
