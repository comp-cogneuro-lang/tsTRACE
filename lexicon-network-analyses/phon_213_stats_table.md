**Table 1**

*Descriptive Statistics for the Lexicon-213 Phonological Lexicon Phonological DAS Network and Its Giant Component*

| Statistic | Full network | Giant component |
|:---|---:|---:|
| *Basic* | | |
| Number of nodes | 212 | 143 |
| Number of edges | 282 | 274 |
| Density (2*m*/[*n*(*n*−1)]) | 0.01261 | 0.02699 |
| *Degree distribution* | | |
| Mean degree ⟨*k*⟩ | 2.66 | 3.83 |
| Median degree | 2.00 | 3.00 |
| Maximum degree | 11 | 11 |
| Degree assortativity (*r*) | 0.40 | 0.35 |
| 75th percentile degree | 4.00 | 5.00 |
| 90th percentile degree | 6.00 | 7.00 |
| 99th percentile degree | 9.89 | 10.00 |
| *Heavy-tail / power-law fit (Clauset MLE)* | | |
| Power-law exponent (*α*) | 2.63 | 2.63 |
| Power-law *x*ₘᵢₙ | 3 | 3 |
| Tail size (*n* with degree ≥ *x*ₘᵢₙ) | 93 | 93 |
| KS distance (*D*) | 0.1772 | 0.1772 |
| vs. lognormal: *R* (*p*) | -3.82 (< .001) | -3.82 (< .001) |
| vs. exponential: *R* (*p*) | -6.46 (< .001) | -6.46 (< .001) |
| vs. truncated power law: *R* (*p*) | -6.46 (< .001) | -6.46 (< .001) |
| *Local structure & community* | | |
| Average local clustering ⟨*C*⟩ | 0.19 | 0.28 |
| Transitivity (global clustering) | 0.33 | 0.33 |
| Number of triangles | 123 | 123 |
| Modularity (greedy, *Q*) | 0.68 | 0.67 |
| *k*-core depth | 5 | 5 |
| *Connectivity & fragmentation* | | |
| Number of components | 62 | 1 (by definition) |
| Hermits (degree 0) | 54 | 0 (by definition) |
| Hermit fraction (of lexicon) | 0.25 | — |
| Giant component (GC) size | 143 | 143 |
| GC fraction (of lexicon) | 0.67 | 1.00 |
| Non-GC subgraph count (size ≥ 2) | 7 | — |
| Non-GC subgraph mean size | 2.14 | — |
| Non-GC subgraph max size | 3 | — |
| *Non-GC subgraph size distribution* | | |
| Dyads (size = 2) | 6 | — |
| Triads (size = 3) | 1 | — |
| Tetrads (size = 4) | 0 | — |
| Size 5–9 | 0 | — |
| Size ≥ 10 (non-GC) | 0 | — |
| *Path structure & small-world reference* | | |
| Average shortest-path length | undefined (disconnected) | 5.30 |
| Diameter | undefined (disconnected) | 14 |
| Radius | undefined (disconnected) | 7 |
| ER reference clustering *C*ᵣ | — | 0.02699 |
| ER reference path length *L*ᵣ | — | 3.69 |
| Small-world σ = (*C*/*C*ᵣ)/(*L*/*L*ᵣ) | — | 7.13 |

*Note.* Statistics were computed on the Phonological DAS phonological neighborhood network derived from a phonological lexicon distributed in `lexicon-213.json` (213 raw entries, after excluding the one entry whose phon field contained '-'). Edges connect form pairs that differ by a single phoneme (deletion, addition, or substitution). The "Full network" column reports values over all 212 entries in the cleaned lexicon; the "Giant component" column reports values restricted to the 143 nodes of the largest connected subgraph. "n/a" marks statistics that are computed at only one of the two scopes by convention; "—" marks statistics that are undefined or vacuous at that scope; "undefined (disconnected)" marks path-based statistics that have no value on the full network because most node pairs are not connected. Density is 2*m*/[*n*(*n*−1)]. Transitivity is the global clustering coefficient (3 × triangles / connected triples). Modularity *Q* was computed by greedy community detection (Clauset–Newman–Moore); the full-network value is partly inflated by the many disconnected components each acting as a trivial community, so the GC-only *Q* is the more substantive measure of community structure. The *k*-core depth is the largest *k* for which a non-empty *k*-core exists; for any *k* ≥ 2 the deepest core lies inside the GC, so the two columns coincide. Hermits are nodes of degree 0. Non-GC subgraphs are connected components of size ≥ 2 excluding the GC. The power-law section reports a Clauset, Shalizi, & Newman (2009) MLE fit, computed separately for the full network's and the giant component's degree distributions; in each case *x*ₘᵢₙ was selected to minimize the Kolmogorov–Smirnov distance between the empirical and fitted complementary CDFs. Log-likelihood ratios *R* compare the power-law fit against alternative tail distributions on the same support; *R* > 0 with small *p* favors the power law, *R* < 0 favors the alternative. The truncated-power-law shape we observe here is consistent with prior reports for phonological neighbor networks across English, Spanish, French, Dutch, and German (Brown et al., 2018), where it is argued to be a string-length-driven property of the one-step-edit construction rule rather than a language-specific feature. GC average shortest-path length, diameter, and radius were computed exactly via chunked all-pairs breadth-first search on the GC's adjacency matrix (scipy.sparse.csgraph). The Erdős–Rényi reference values use the GC's own *n* and edge density: *C*ᵣ = *p* and *L*ᵣ = ln *n* / ln ⟨*k*⟩. Small-world σ > 1 indicates greater clustering than a random graph of the same size and density without proportionally longer paths; values much greater than 1 are characteristic of small-world structure (Watts & Strogatz, 1998; Humphries & Gurney, 2008).
