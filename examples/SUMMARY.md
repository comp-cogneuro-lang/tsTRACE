# Summary of the example simulations

This page lists every example, the publication it replicates, and how closely
it matches the original. Each example's README has the full design and
numbers; each `figures/stats.txt` has the values behind its figures.

How closely each example matches is rated as:
- **Close**: the paper's reported numbers are reproduced, or nearly so.
- **Qualitative**: the paper's pattern is reproduced, but the numbers differ
  or the paper gives none to compare.
- **Partial**: part of the paper's result is not reproduced.

Sources of difference that recur across the examples:
- **Software.** The originals ran in the C implementation of TRACE (1986–2001)
  or jTRACE (2015). tsTRACE reproduces C TRACE to within about 0.015 on a
  like-for-like test (see [02a](02a-allopenna-1998/)).
- **Lexicon.** The surviving 212-word TRACE lexicon differs slightly from the
  1986 one: *blush* and *regal* are missing and are added back where needed.
- **Reconstructions.** Some stimuli exist only as figures or prose, and some
  readout details were never published. Each README says what was
  reconstructed.

## Overview

| Example | Replicates | Match |
|---|---|---|
| [01-ganong](01-ganong/) | Ganong effect (Ganong, 1980; McClelland & Elman, 1986) | Qualitative |
| [02a-allopenna-1998](02a-allopenna-1998/) | Allopenna, Magnuson & Tanenhaus (1998), Figs. 1–2, close version | Partial |
| [02b-cohort-rhyme-minimal](02b-cohort-rhyme-minimal/) | Allopenna et al. (1998), whole-lexicon version | Partial |
| [03-length](03-length/) | Short- vs long-word advantages (Magnuson et al., 2013) | Qualitative |
| [04-restoration-simple](04-restoration-simple/) | Phoneme restoration, one word (Magnuson, 2015) | Qualitative |
| [05-restoration-magnuson2015](05-restoration-magnuson2015/) | All figures and statistics of Magnuson (2015) | Partial |
| **McClelland & Elman (1986)** | [original-trace-replications/](original-trace-replications/) | |
| [01-lexical-effect](original-trace-replications/01-lexical-effect/) | Figs. 5–7: lexical effect, time pressure, ambiguity | Close |
| [02-word-final](original-trace-replications/02-word-final/) | Fig. 8: word-final lexical effects | Close |
| [03-reaction-time](original-trace-replications/03-reaction-time/) | Figs. 9–11: monitoring times | Close |
| [04-conspiracy](original-trace-replications/04-conspiracy/) | Figs. 12–13: phonotactics as lexical conspiracy | Close |
| [05-trading-relations](original-trace-replications/05-trading-relations/) | Figs. 15–18: cue trading | Qualitative |
| [06-categorical-perception](original-trace-replications/06-categorical-perception/) | Figs. 19–22: identification and discrimination | Close (identification), Qualitative (ABX) |
| [07-mismatching-onset](original-trace-replications/07-mismatching-onset/) | Fig. 24: *legal* / *lugged* | Close |
| [08-product](original-trace-replications/08-product/) | Figs. 25–26: time course of *product* | Close |
| [09-all-words](original-trace-replications/09-all-words/) | p. 62: every word recognized | Close |
| [10-party](original-trace-replications/10-party/) | Figs. 27–28: *party*, *par tea*, *bar tea*, *parkey* | Close |
| [11-bus-stop](original-trace-replications/11-bus-stop/) | Fig. 29: *bus stop*, *brush shop* | Close |
| [12-nonword-boundaries](original-trace-replications/12-nonword-boundaries/) | Fig. 30: boundaries after words and nonwords | Qualitative |
| [13-tar-box](original-trace-replications/13-tar-box/) | Fig. 31: *tar box* / *guitar box* | Close |
| [14-short-sentence](original-trace-replications/14-short-sentence/) | Fig. 32: *she shut a box* | Close |
| [15-all-word-pairs](original-trace-replications/15-all-word-pairs/) | pp. 62–64: parsing all word pairs | Close |
| **McClelland (1991)** | [mcclelland-1991/](mcclelland-1991/) | |
| [01-luce-readout](mcclelland-1991/01-luce-readout/) | Fig. 4: deterministic IA, Luce readout | Close |
| [02-input-noise](mcclelland-1991/02-input-noise/) | Fig. 6: input noise | Close |
| [03-intrinsic-noise](mcclelland-1991/03-intrinsic-noise/) | Fig. 8: intrinsic noise | Close |
| [04-stochastic-trace](mcclelland-1991/04-stochastic-trace/) | Fig. 9: stochastic TRACE | Close |
| **Dahan et al. (2001)** | [dahan-2001/](dahan-2001/) | |
| [01-subcategorical-eyetracking](dahan-2001/01-subcategorical-eyetracking/) | Dahan, Magnuson, Tanenhaus & Hogan (2001), Fig. 4 | Close |
| [02-subcategorical-lexical-decision](dahan-2001/02-subcategorical-lexical-decision/) | same paper, lexical-decision simulation (pp. 529–530) | Qualitative |
| [03-frequency-cohorts](dahan-2001/03-frequency-cohorts/) | Dahan, Magnuson & Tanenhaus (2001), Exp. 1 (Figs. 5–7) | Partial |
| [04-frequency-targets](dahan-2001/04-frequency-targets/) | same paper, Exp. 2 (Figs. 9–12) | Qualitative |

## Details

### Standalone examples

**01-ganong.** A 7-step /b/–/p/ continuum before /l^g/ (*plug*) and /l^d/
(*blood*). At the midpoint, P(/p/) is 0.96 vs 0.13 at cycle 99. The contexts
diverge only around cycle 45, after the word is identified. This is M&E's
account of the Ganong effect. M&E simulated a single midpoint rather than a
continuum, so there is no curve to compare.

**02a-allopenna-1998.**
- **What matches:** the referent and cohort match the paper's Fig. 1 closely.
  The referent rises to about 0.6; the cohort peaks near 0.18–0.2, then falls.
- **What doesn't:** rhymes do not rise. In the paper they reach about 0.13; here
  they stay at or below resting level in 13 of 16 runs.
- **Not a tsTRACE difference:** C TRACE gives the same values for the same input
  and lexicon.
- **What was reconstructed:** the original transcriptions, neighbor lists and
  sigmoid-k values are lost.
- **Tried without effect:** many parameter and transcription changes. The cause
  is unresolved.

**02b-cohort-rhyme-minimal.** The same comparison over every cohort pair (918)
and rhyme pair (658) in the lexicon. Cohorts behave as in the paper, peaking at
0.10. Rhymes never rise above rest on average, as in 02a.

**03-length.** Short words lead from cycle 19 to 45. Long words overtake them at
cycle 46 and end far higher (0.79 vs 0.42). This is the pattern reported by
Magnuson et al. (2013).

**04-restoration-simple.** For *luxury*, noise replacing a phoneme activates it
more than silence does, at every position. With the original phonemes, /k/ and
/g/ beat the replaced phoneme early, as Magnuson (2015) reports.

**05-restoration-magnuson2015.** All 13 figures, footnote 4 and the text's
statistics.
- **Matches:**
  - the lexicon counts (4 vs 3 words beginning /r^/ vs /l^/; 17 vs 10
    containing them);
  - the word-set sizes (75/31/8 words of 3/5/7 phonemes; the paper has 73/31/8);
  - the clustering of original vs revised phonemes (r = 0.988, "virtually
    indistinguishable");
  - the qualitative patterns: noise > silence; /k/ and /g/ winning with the
    original phonemes; no single winner with the revised ones.
- **Differences:**
  - The replaced phoneme loses in 86% of noisy simulations (paper: about 75%).
  - Early noise transients are somewhat smaller than in the published figures.
  - **Not reproduced:** the paper says the phoneme that beats the replaced one
    is "usually" backed by a more frequent (or equally frequent) bigram. Here it
    is usually backed by a *less* frequent one: 83 of 109 words at initial
    position and 51 of 91 at medial position. The bigram counts or the
    definition of "next-most-active" may differ from the paper's.
  - Footnote 5 is not replicated, because its lexicons are unspecified.

### McClelland & Elman (1986)

All examples use the original parameters, M&E's Luce exponent k = 10, and the
jTRACE gallery's inputs where they exist.

- **01 lexical effect.**
  - At the end of the run, P(/p/) for /?l^g/ is 0.85 and for /?l^S/ is 0.23.
  - The contexts diverge only after about cycle 40, after Fox's 500-ms deadline.
  - A clear /p/ reaches 0.95 within 12 cycles.
  - Clear segments ignore the lexicon.
  - The early /p/ bias M&E describe is present, and an empty-lexicon control
    shows that it is lexical.
- **02 word-final.** At Fox's deadline, the lexical effect averages 0.50 for
  word-final ambiguities and about 0 for word-initial ones. M&E's prediction
  holds; their Fig. 8 is a snapshot, so there are no numbers to compare.
- **03 reaction time.**
  - *secret* reaches criterion 3 cycles (75 ms) before *guldut*, exactly M&E's
    figure.
  - Word-initial /t/ shows no word advantage.
  - Criterion is reached at cycle 22 rather than "about 30".
- **04 conspiracy.**
  - /s?i/ goes to /l/ (0.98); with no lexicon it stays at 0.48/0.48.
  - In /?luli/, the illegal /t/ overtakes the legal /p/ at cycle 39 (*truly*).
  - /r/ stays active at the second segment (0.33), as M&E note.
- **05 trading relations.**
  - The cues trade: the 50% VOT point falls by one step per F1OF step.
  - M&E's three equivalent combinations come out equal (0.90–0.91), but above
    their 0.82–0.85.
  - The feature patterns are reconstructed from M&E's drawings (Figs. 15, 19),
    fitted to their one number (75%).
  - M&E's stated stimulus range contradicts their Fig. 18, so the values were
    centered on the boundary.
- **06 categorical perception.**
  - Stimulus 5 receives 89% as much bottom-up input for /k/ as for /g/ (M&E:
    88%), yet P(/k/) is 0.08 (M&E: 0.04). The boundary falls between stimuli 6
    and 7, as in M&E.
  - Feedback makes within-category stimuli nearly identical at the feature
    level, and a control without feedback confirms that this is its doing.
  - ABX accuracy peaks at 0.63, lower than M&E's Fig. 21 suggests.
- **07 mismatching onset.**
  - *legal* wins, and *regal* never exceeds 0.02.
  - *rugged* recovers from the mismatching /l/, but 32 cycles later than from
    intact input.
- **08 product.**
  - Competitors fade 8–13 cycles after their mismatching phoneme.
  - *produce* leads *product* until the /^/ arrives, as M&E describe.
- **09 all words.** All 212 words are recognized, by at most 15 cycles after
  their last phoneme, matching M&E's "no mistakes".
- **10 party.**
  - /parti/ goes from *par* (early) to *party*.
  - /par-ti/ gives *par* + *tea*; /barti/ gives *bar* + *tea* over *art*.
  - /parki/ gives *park*.
  - Not in M&E: a misaligned *part* nearly ties in /par-ti/.
- **11 bus stop.** Both readings of /b^stap/ survive (*stop* 0.56, *bus* 0.50,
  *top* 0.37), and *brush* and *shop* share the /S/.
- **12 nonword boundaries.**
  - After *possible*, nothing straddles the boundary.
  - After a nonword, straddling words reach 0.16–0.17 when the /t/ of *target*
    arrives.
  - M&E show this only as Trace displays, so the measure ("best straddling
    word") is defined here.
- **13 tar box.**
  - In *tar box*, *target* stays a close rival until *box* arrives.
  - In *guitar box*, *guitar* is decided early.
- **14 short sentence.** *she*, *shut*, *a* and *box* each win their stretch.
  *a* is the weakest (0.26), as M&E note.
- **15 all word pairs.**
  - 92.6% of pairs are parsed correctly at the main readout (93–96% at later
    readouts); M&E report 90%.
  - The lexicon is 212 words, not 211. The trace is longer (135 slices) to fit
    the longest pairs.
  - The readout time is chosen here, since M&E don't give one.

### McClelland (1991)

- **01 Luce readout.**
  - Without noise, the Luce readout gives S-shaped z curves, and context moves
    the boundary.
  - Parallel lines explain only 92.5% of the variance, against 99.98% in 02 and
    03.
  - k is not given in the paper; k = 10 is used.
- **02 input noise.**
  - The classical pattern explains 99.98% of the variance (paper: 99.97%),
    with P(/r/) from 0.02 to 0.98, the paper's range.
  - The /l/ input is taken as 1 minus /r/'s, not "minus", which the paper's own
    analysis requires.
- **03 intrinsic noise.**
  - 99.98% of the variance explained (paper: 99.97%).
  - The noise is added after the 0.1 input scaling, the reading that reproduces
    the paper's probability range.
- **04 stochastic TRACE.**
  - With 500 trials per condition, parallel lines explain 99.45% of the
    variance (paper: 99.94%).
  - The fitted spacing puts the neutral liquid exactly midway, and the contexts
    are in the paper's order. The deterministic Luce version explains 96.0%.
  - The liquids are somewhat more discriminable than the paper's (z from −2.65
    to 3.09 vs about −1.5 to 2.2), and one cell is at ceiling.
  - The liquids follow footnote 4. The neutral liquid's diffuseness, which the
    paper doesn't give, is the average of /r/ and /l/.

### Dahan et al. (2001)

These examples use the papers' items, transcribed into TRACE phonemes from
their appendices (*net* /git/, *cone* /kud/). Cross-spliced items use
tsTRACE's splice syntax; for example, W2W1 for *net* is `-gi{k6t}-`.
Distractors are not listed in the papers and are chosen at random (seeded).
The papers started from a 235-word lexicon that isn't available, so their
lexicons are rebuilt from the default lexicon plus the stimuli (239 and 281
words, against the papers' 257 and 303).

- **01 subcategorical mismatch, eye tracking.**
  - The competitor W2 peaks at 0.174, 0.189 and 0.251 for W1W1, N3W1 and
    W2W1; the paper's figure reads about 0.14, 0.16 and 0.23.
  - The target reaches 0.53–0.55 (paper about 0.50).
  - Predicted target fixations reach 0.5 in the paper's order (W1W1 < N3W1 <
    W2W1), but earlier: cycles 31–36 against about 40–48.
- **02 subcategorical mismatch, lexical decision.**
  - W2W1 and N3W1 latencies stay within 0.7 cycles of each other and above
    W1W1 up to a threshold of 0.25, then diverge, the pattern the paper
    describes.
  - The paper only outlines the decision rule, so the noisy-threshold rule is
    a reconstruction.
- **03 frequency, cohort competitors.**
  - With resting levels and post-activation biases, the high- vs low-frequency
    difference is present before any input (0.12 and 0.10).
  - With connection weights it starts at 0 and builds up, the contrast the
    paper emphasizes.
  - But the weight method's difference comes later (above 0.02 only at about
    400 ms) and grows larger (peak 0.21 at about 600 ms) than the paper
    describes.
  - The likely reason is a mechanism difference. tsTRACE, following jTRACE,
    applies frequency to both phoneme→word and word→phoneme connections, with
    a different formula from the paper's Eq. 4. The engine was not changed.
- **04 frequency, targets.**
  - Every frequency method favors high-frequency targets.
  - With Allopenna et al.'s scaled choice rule, only the post-activation
    variant still shows a difference before any input (0.083), as the paper
    notes.
  - Without frequency the difference is essentially 0 (0.002). The paper found
    a slight one, which it attributed to its items' neighborhoods.
  - The papers' fits to the human data (RMS, r²) need the eye-tracking data and
    are not reproduced.

The original simulation code would settle four things: the connection-weight
formula, the lexical-decision rule, exactly how the scaled rule was applied,
and the base lexicon and distractors.

