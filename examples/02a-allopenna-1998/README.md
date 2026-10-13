# Example 2a: Allopenna, Magnuson & Tanenhaus (1998), close replication

Allopenna, P. D., Magnuson, J. S., & Tanenhaus, M. K. (1998). Tracking the time
course of spoken word recognition using eye movements: Evidence for continuous
mapping models. *Journal of Memory and Language, 38*, 419–439.

This example rebuilds the paper's TRACE simulations (Experiment 1, Figs. 1–2)
as closely as possible. The original code and notes no longer exist, so some
pieces had to be reconstructed. [Example 2b](../02b-cohort-rhyme-minimal/) is
the minimal-assumption version over the whole lexicon.

## What follows the paper

- The eight referent / cohort / rhyme / unrelated sets of Table 1 (`items/index.js`).
- Input: "the" followed by the referent, run for 90 cycles.
- Lexicon: the TRACE lexicon plus the experimental items plus their one-phoneme
  neighbors. Ours also comes to 268 words, the same number as the paper's.
- Default parameters.
- Linking hypothesis (pp. 424–425), applied in `plot.py`:
  - response strength exp(k·a) for the four pictured items;
  - the Luce choice rule;
  - scaling by Δt = max(activation at t) / max(activation over the trial);
  - a 6-cycle delay for saccade programming;
  - 1 cycle = 11 ms, sampled every 3 cycles.
- Results are shown for fixed k = 7 (the paper reports this fit) and for a
  sigmoid k (its best fits).

## What had to be reconstructed

- **Transcriptions.** The paper doesn't give them, and TRACE has no /n f h w/.
  `items/index.js` follows jTRACE's convention, in which syllabic /r l/ are written
  without a schwa (*bikr*, *bitl*, *dalr*, *kalr* appear in jTRACE's lexicons),
  and maps missing sounds to the nearest TRACE phoneme: n→d, f→p, w→u, h
  dropped. Edit the table to try alternatives.
- **Neighbors.** The paper found them with the Wordprobe utility, which is no
  longer available. Ours are the items' one-phoneme neighbors in jTRACE's
  901-word lexicon.
- **Sigmoid k.** Eq. 5 gives its form but not its values. The values in
  `plot.py` were chosen here and are labeled as such in the figure.
- **Copies.** Activations come from each word's most active copy, among copies
  aligned no earlier than one phoneme before the referent.

## Run

```
node simulate.js        # 16 simulations, ~5 s
python3 plot.py
```

## Items

The `items/` folder holds the stimuli:
- `index.js`: the transcriptions, item sets, carrier, and neighbor list (edit
  this to change the stimuli).
- `lexicon.xml`: the 268-word lexicon. In the GUI, open Config → Lexicon and use
  *Load from XML*.
- `config.json`: default parameters with that lexicon and `-d^bikr-` ("the
  beaker") as model input. In the GUI, open Config → Parameters and use *Load
  from JSON*; then type `-d^` plus any item's transcription (from `index.js`)
  as the model input.

`lexicon.xml` and `config.json` are regenerated from `index.js` every time
`simulate.js` runs.

Figures (±1 SE across the 8 sets):
- `fig1-activations`: raw activations, and the same with negative values
  shown as 0, as the paper's Fig. 1 displays them.
- `fig2-predicted`: predicted fixation proportions, fixed k = 7 and sigmoid k.
- `fig3-pairs`: each referent / rhyme pair in both directions (the referent
  presented with the rhyme as competitor, and the rhyme presented with the
  referent as competitor), with the set's unrelated item as a baseline. Each
  set is run twice for this (16 simulations); Figs. 1 and 2 use only the
  forward runs, as in the paper.

## How close it gets

The referent and cohort match the paper's Fig. 1 closely: the referent rises to
about 0.6, and the cohort peaks near 0.18–0.2, then falls. **Rhymes do not**:
in the paper they rise to about 0.13 from cycle ~35 on, but here they stay
below resting level. The one exception is *handle*, which this transcription
(*addl*) embeds in *candle* (*kaddl*).

This is not a tsTRACE difference. The original C implementation of TRACE gives
the same values for the same input and lexicon (*beaker* input: *beaker* 0.62,
*beetle* 0.14, *speaker* 0.00 in C TRACE, vs 0.63, 0.135, −0.003 in tsTRACE).
Bottom-up input alone does activate rhymes: with word-level inhibition turned
off, *speaker* reaches 0.90. So the rhymes are being suppressed by lexical
competition. Whatever let rhymes rise in 1998 must lie in details we can't
recover: the actual transcriptions, neighbors, or settings.
