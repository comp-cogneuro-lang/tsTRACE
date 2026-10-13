# Replications of McClelland (1991)

McClelland, J. L. (1991). Stochastic interactive processes and the effect of
context on perception. *Cognitive Psychology, 23*, 1–44.

Massaro (1989) argued that interactive activation (IA) models such as TRACE
cannot produce the classical joint effects of context and stimulus. In
classical models, signal detection theory or Massaro's fuzzy logical model,
context and stimulus act independently, so z-transformed choice probabilities
fall on parallel straight lines. McClelland showed where the original
formulation went wrong and how to fix it:

- **What went wrong.** Applying the Luce choice rule to the *output* of a
  deterministic IA network distorts the pattern, because competition and
  bounded activations have already done the choosing.
- **The fix.** Add noise, to the input or to processing itself, and let the
  most active alternative be the response. The classical pattern then emerges,
  in a small network and in full TRACE. This is the origin of tsTRACE's
  `stochasticitySD` parameter.

This folder holds one example per simulation in the paper. The paper's other
figures (1–3, 10) are diagrams or analytic illustrations, and its Boltzmann
machine section is a proof rather than a simulation.

| Example | Paper | Model | What it shows |
|---|---|---|---|
| [01-luce-readout](01-luce-readout/) | Fig. 4 | small IA network, deterministic | the Luce readout distorts the joint effects |
| [02-input-noise](02-input-noise/) | Fig. 6 | small IA network, noisy input | the classical pattern (99.98% of variance) |
| [03-intrinsic-noise](03-intrinsic-noise/) | Fig. 8 | small IA network, noisy processing | the classical pattern (99.98%) |
| [04-stochastic-trace](04-stochastic-trace/) | Fig. 9 | full TRACE, noisy processing | the classical pattern in TRACE |

## The small network (`lib/iac.js`)

This is McClelland's Fig. 5 network, not TRACE:

- **Units.** Context phonemes /s/, /p/ and /t/; target phonemes /l/ and /r/;
  and "word" units /sl/, /pl/, /pr/ and /tr/.
- **Connections.** Each word unit is excitatorily linked to its two phonemes,
  and units within each set inhibit each other. So /s/ favors /l/, /t/ favors
  /r/, and /p/ is neutral.
- **Inputs.** Inputs are switched on together and left on, with no time course.

The update rule and parameters are from pp. 11–12 and footnote 1: maximum 1,
minimum −0.2, rest −0.1, decay 0.1, all inputs scaled by 0.1, and running
averages with λ = 0.05.

Two details had to be interpreted:

- **The /l/ input.** The paper says /l/ gets "minus" /r/'s input, but its own
  analysis (p. 15) and its condition descriptions require 1 minus. These
  examples use 1 minus.
- **Where intrinsic noise is added.** Here the noise goes in after the 0.1
  scaling. With the paper's SD of 0.14, that gives the range of probabilities
  it reports; added before the scaling, the network is almost noiseless.

## Shared conventions

- **Plotting.** `lib/zplot.py` does the z-transform and the classical fit:
  parallel lines, with one slope and one intercept per context. It reports the
  percentage of variance explained, the statistic the paper uses.
- **Reproducibility.** Simulations are seeded.
- **Smoke test.** `node examples/smoke-test.js` runs all four examples on a
  tiny design.
