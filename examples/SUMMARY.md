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
| [01-subcategorical-eyetracking](dahan-2001/01-subcategorical-eyetracking/) | Dahan, Magnuson, Tanenhaus & Hogan (2001), Fig. 4 (checked against the original code) | Close |
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
  - With 500 trials per condition, parallel lines explain 99.63% of the
    variance (paper: 99.94%).
  - It uses the phoneme–word gains of McClelland's code (0.03, 0.015), not the
    paper's printed 0.05 and 0.02 (Strauss et al., 2007, footnote 7). With
    them the context effect matches the paper's (about 1.0 z unit vs 1.2),
    evenly spaced; the printed gains double it.
  - The fitted spacing puts the neutral liquid midway, and the contexts are in
    the paper's order. The deterministic Luce version explains 98.1%.
  - The liquid effect is about 30% larger than the paper's (4.2 vs about
    3.2 z units). The features, noise and timing were checked against the
    paper; the cause is unexplained.
  - The liquids follow footnote 4. The neutral liquid's diffuseness, which the
    paper doesn't give, is the average of /r/ and /l/.

### Dahan et al. (2001)

The user's archive of the original subcategorical-mismatch simulations
(`SubCatSims_2k0325`, final version "Try3", March 2000) settled most of what
the paper leaves out:
- **Splicing** is done on the feature input at slice 24, which tsTRACE's
  splice syntax reproduces exactly (`-gi{k9t}-` for *net*, W2W1).
- **Parameters.** The compiled defaults were used, not the M&E values the
  paper states: word→phoneme excitation 0.015, phoneme inhibition 0.05, and
  the "distribution" phoneme set with its own feature spreads.
- **Lexicon.** The 235-word distribution lexicon plus the stimuli.
- **Readout.** The most active copy of each word, a plain Luce rule (k = 7
  over the four pictures) with no scaling or delay, and 100 cycles.

With those settings, tsTRACE matches a compiled copy of the archived C code to
within 0.012 for every word unit and cycle on a test item.

The archived C code also contains a bug: the phoneme→word loop advances the
weight pointer twice. The examples follow the intended computation. The
corrected C build agrees with tsTRACE; the build as written differs.

The archive also holds some frequency-paper material:
- The resting-level formula, rest + s·log10(1 + f), commented out in the
  archived code.
- A weight method computed from `wfrq` = s·log10(1 + f), but through the
  buggy line above.
- The AMT script's +0.30 activation shift.
- One averaged Experiment 1 prediction (`FrqE1.PROBDATA`), compared in 03.

jTRACE supplied the rest of the frequency setup: its `slex_dahan2001` lexicon
is the distribution lexicon plus the stimuli, as the paper describes, and its
`freq-eye-track.jt` template lists the Experiment 1 distractors. Strauss,
Harris & Magnuson (2007) report that jTRACE matched the paper's Fig. 6 with an
RMS error of about 0.01, using the weight formula tsTRACE inherited.

Neither the archive nor the paper has the lexical-decision code.

- **01 subcategorical mismatch, eye tracking.** Close.
  - With the archived settings, the competitor (W2) peaks at 0.151, 0.164 and
    0.259 for W1W1, N3W1 and W2W1; the published Fig. 4 reads about 0.15,
    0.165 and 0.23. The first two match almost exactly, and the order and
    timing match.
  - The published fixations start at exactly 0.25, confirming the unscaled
    readout.
  - **Not reproduced by any setting:** the published target sags after about
    cycle 70 (to about 0.47) and its fixations end near 0.90; here they end at
    0.88–0.97. The published figure probably came from a later run than the
    archived one.
  - A second figure shows the same simulation with the M&E parameters the
    paper states.
- **02 subcategorical mismatch, lexical decision.** Qualitative.
  - W2W1 and N3W1 latencies stay close and above W1W1 up to a moderate
    threshold, then diverge, as described.
  - The decision rule is still a reconstruction (no code survives).
- **03 frequency, cohort competitors.** Partial.
  - Resting levels and post-activation biases give a frequency difference
    before any input. Connection weights build it up gradually, the paper's
    key contrast.
  - Built on the paper's lexicon (the distribution lexicon plus the stimuli)
    with jTRACE's distractors.
  - The resting-level run is within RMS 0.020 of an archived TRACE prediction
    for this experiment (0.011 allowing a 2-cycle shift). That prediction
    seems to come from an earlier fit with a scale of about 0.04.
  - But the weight method's difference comes later and grows larger than the
    paper describes.
  - Three versions of the weight method disagree:
    - the paper's Eq. 4: a·[1 + a·s·log10(1 + f)], phoneme→word only;
    - the archived C code: s·log10(1 + f), through the buggy line;
    - tsTRACE (following jTRACE): input × (1 + s·log10 f), in both directions.
  - jTRACE matched the paper with tsTRACE's form, and changing the lexicon
    made no difference, so the cause is still open. The phoneme set is one
    candidate.
- **04 frequency, targets.** Qualitative.
  - Every frequency method favors high-frequency targets.
  - With the scaled choice rule (including the archived +0.30 shift), the
    difference before any input is small for resting levels (0.010) and
    larger for post-activation (0.080), as the paper notes for its Eq. 8.
  - The papers' fits to the human data need the eye-tracking data and are not
    reproduced.
