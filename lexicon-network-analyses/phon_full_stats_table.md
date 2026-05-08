**Table 1**

*Descriptive Statistics for the Lexicon-Lemma Phonological Lexicon Phonological DAS Network and Its Giant Component*

| Statistic | Full network | Giant component |
|:---|---:|---:|
| *Basic* | | |
| Number of nodes | 17,444 | 5,599 |
| Number of edges | 22,720 | 21,307 |
| Density (2*m*/[*n*(*n*−1)]) | 0.00015 | 0.00136 |
| *Degree distribution* | | |
| Mean degree ⟨*k*⟩ | 2.60 | 7.61 |
| Median degree | 0.00 | 5.00 |
| Maximum degree | 36 | 36 |
| Degree assortativity (*r*) | 0.68 | 0.64 |
| 75th percentile degree | 2.00 | 11.00 |
| 90th percentile degree | 9.00 | 18.00 |
| 99th percentile degree | 26.00 | 29.00 |
| *Heavy-tail / power-law fit (Clauset MLE)* | | |
| Power-law exponent (*α*) | 1.60 | 2.77 |
| Power-law *x*ₘᵢₙ | 1 | 9 |
| Tail size (*n* with degree ≥ *x*ₘᵢₙ) | 7,822 | 1,809 |
| KS distance (*D*) | 0.1187 | 0.1221 |
| vs. lognormal: *R* (*p*) | -27.65 (< .001) | -13.42 (< .001) |
| vs. exponential: *R* (*p*) | -7.35 (< .001) | -20.32 (< .001) |
| vs. truncated power law: *R* (*p*) | -32.10 (< .001) | -20.32 (< .001) |
| *Local structure & community* | | |
| Average local clustering ⟨*C*⟩ | 0.09 | 0.27 |
| Transitivity (global clustering) | 0.32 | 0.32 |
| Number of triangles | 29,745 | 29,655 |
| Modularity (greedy, *Q*) | 0.65 | 0.64 |
| *k*-core depth | 17 | 17 |
| *Connectivity & fragmentation* | | |
| Number of components | 10,517 | 1 (by definition) |
| Hermits (degree 0) | 9,622 | 0 (by definition) |
| Hermit fraction (of lexicon) | 0.55 | — |
| Giant component (GC) size | 5,599 | 5,599 |
| GC fraction (of lexicon) | 0.32 | 1.00 |
| Non-GC subgraph count (size ≥ 2) | 894 | — |
| Non-GC subgraph mean size | 2.49 | — |
| Non-GC subgraph max size | 37 | — |
| *Non-GC subgraph size distribution* | | |
| Dyads (size = 2) | 673 | — |
| Triads (size = 3) | 131 | — |
| Tetrads (size = 4) | 47 | — |
| Size 5–9 | 40 | — |
| Size ≥ 10 (non-GC) | 3 | — |
| *Path structure & small-world reference* | | |
| Average shortest-path length | undefined (disconnected) | 7.12 |
| Diameter | undefined (disconnected) | 26 |
| Radius | undefined (disconnected) | 14 |
| ER reference clustering *C*ᵣ | — | 0.00136 |
| ER reference path length *L*ᵣ | — | 4.25 |
| Small-world σ = (*C*/*C*ᵣ)/(*L*/*L*ᵣ) | — | 119.67 |

*Note.* Statistics were computed on the Phonological DAS phonological neighborhood network derived from a phonological lexicon distributed in `lexicon-lemma.json` (17,445 raw entries, after excluding the one entry whose phon field contained '-'). Edges connect form pairs that differ by a single phoneme (deletion, addition, or substitution). The "Full network" column reports values over all 17,444 entries in the cleaned lexicon; the "Giant component" column reports values restricted to the 5,599 nodes of the largest connected subgraph. "n/a" marks statistics that are computed at only one of the two scopes by convention; "—" marks statistics that are undefined or vacuous at that scope; "undefined (disconnected)" marks path-based statistics that have no value on the full network because most node pairs are not connected. Density is 2*m*/[*n*(*n*−1)]. Transitivity is the global clustering coefficient (3 × triangles / connected triples). Modularity *Q* was computed by greedy community detection (Clauset–Newman–Moore); the full-network value is partly inflated by the many disconnected components each acting as a trivial community, so the GC-only *Q* is the more substantive measure of community structure. The *k*-core depth is the largest *k* for which a non-empty *k*-core exists; for any *k* ≥ 2 the deepest core lies inside the GC, so the two columns coincide. Hermits are nodes of degree 0. Non-GC subgraphs are connected components of size ≥ 2 excluding the GC. The power-law section reports a Clauset, Shalizi, & Newman (2009) MLE fit, computed separately for the full network's and the giant component's degree distributions; in each case *x*ₘᵢₙ was selected to minimize the Kolmogorov–Smirnov distance between the empirical and fitted complementary CDFs. Log-likelihood ratios *R* compare the power-law fit against alternative tail distributions on the same support; *R* > 0 with small *p* favors the power law, *R* < 0 favors the alternative. The truncated-power-law shape we observe here is consistent with prior reports for phonological neighbor networks across English, Spanish, French, Dutch, and German (Brown et al., 2018), where it is argued to be a string-length-driven property of the one-step-edit construction rule rather than a language-specific feature. GC average shortest-path length, diameter, and radius were computed exactly via chunked all-pairs breadth-first search on the GC's adjacency matrix (scipy.sparse.csgraph). The Erdős–Rényi reference values use the GC's own *n* and edge density: *C*ᵣ = *p* and *L*ᵣ = ln *n* / ln ⟨*k*⟩. Small-world σ > 1 indicates greater clustering than a random graph of the same size and density without proportionally longer paths; values much greater than 1 are characteristic of small-world structure (Watts & Strogatz, 1998; Humphries & Gurney, 2008).
