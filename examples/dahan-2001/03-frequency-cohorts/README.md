# 03. Frequency of cohort competitors (CP Exp. 1, Figs. 5–7)

Dahan, Magnuson & Tanenhaus (2001), pp. 333–345.

Listeners hearing *bench* fixated a high-frequency cohort competitor (*bed*)
more than a low-frequency one (*bell*), from early in the word. The paper
compared three ways of putting frequency into TRACE, and no frequency at all,
against these data.

## Simulation

- **Items.** 17 target / HF cohort / LF cohort triplets in the paper's TRACE
  transcriptions, plus one unrelated distractor each (seeded pick). Each
  target is presented alone for 100 cycles.
- **Lexicon.** Default plus every stimulus of both experiments, with
  Kučera–Francis frequencies (281 entries; the paper had 303).
- **Parameters.** M&E defaults except word resting level −0.3 (Appendix B).
- **The four methods** (scaling constants from Appendix B):

  | Method | Implementation |
  |---|---|
  | No frequency | — |
  | Resting levels | rest = −0.3 + 0.06·log10(1 + f), f capped at 1000 |
  | Connection weights | tsTRACE's frequency weighting with s = 0.13 (see `../README.md` for how it differs from the paper's Eq. 4) |
  | Post-activation | S = e^(7a)·log10(15 + f) on the no-frequency activations |

- **Linking.** Luce choice (k = 7) over the four pictures. Time runs at
  12.4 ms per cycle, in 33.12-ms frames, after the paper's fitted delays: 3
  frames for no frequency and resting levels, 4 for weights, 2 for
  post-activation.

## Run

```
node simulate.js        # 51 simulations, ~4 s
python3 plot.py
```

## Figures

- `fig05-activations`: activations under no frequency, resting levels and
  connection weights.
- `fig06-fixations`: predicted fixations for the four methods.
- `fig07-hf-minus-lf`: the HF − LF cohort difference over time.
- `stats.txt`: differences by window, and their onsets.

All curves show the mean ± 1 SE over the 17 items.

## Results

HF − LF predicted cohort fixations:

| Method | At 0 ms | Mean 200–500 ms | Peak |
|---|---|---|---|
| No frequency | 0.000 | 0.002 | 0.019 (530 ms) |
| Resting levels | 0.116 | 0.123 | 0.147 (530 ms) |
| Connection weights | 0.000 | 0.039 | 0.214 (596 ms) |
| Post-activation | 0.099 | 0.119 | 0.135 (464 ms) |

The paper's data average 0.080 over 200–500 ms.

- **Every frequency method favors the HF cohort; no frequency doesn't.**
- **The paper's key qualitative contrast reproduces.** Resting levels and
  post-activation build in a frequency bias before any input arrives (0.116
  and 0.099 at 0 ms). Connection weights start at no difference, and the
  difference grows as bottom-up input arrives. The paper singles this out as
  the one feature of the data only the weight method captures.
- **The weight method's difference arrives later and grows larger than the
  paper describes.** It first passes 0.02 at about 400 ms, peaks at 0.21 near
  600 ms, and averages only 0.039 over 200–500 ms. The paper describes its
  onset as "gradual (although still immediate and fast)". tsTRACE's weighting
  differs from the paper's Eq. 4 (`../README.md`), which is the likeliest
  source of the difference.
- **No fit statistics.** The paper's RMS and r² comparisons need the human data
  and are not reproduced.
