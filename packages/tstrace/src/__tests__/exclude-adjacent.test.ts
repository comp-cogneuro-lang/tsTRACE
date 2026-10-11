import {
  createDefaultConfig,
  doSimAnalysis,
  TraceCalculationType,
  TraceChoice,
  TraceDomain,
  TraceSim,
} from '..';

const parse = (label: string) => {
  const m = /^(.*) \[(\d+)\]$/.exec(label)!;
  return { item: m[1], alignment: +m[2] };
};

const hasAdjacentPair = (labels: string[]) => {
  const seen = new Set(labels);
  return labels.some((l) => {
    const { item, alignment } = parse(l);
    return seen.has(`${item} [${alignment + 1}]`);
  });
};

describe('excludeAdjacent', () => {
  const sim = new TraceSim(createDefaultConfig());
  sim.cycle(60);

  for (const domain of [TraceDomain.WORDS, TraceDomain.PHONEMES]) {
    const base = {
      sim,
      domain,
      itemsToWatch: 20,
      calculationType: TraceCalculationType.MAX_POSTHOC,
      choice: TraceChoice.NORMAL,
      kValue: 0,
    };

    test(`removes alignment-adjacent copies (${TraceDomain[domain]})`, () => {
      const off = doSimAnalysis({ ...base }).map((d) => d.label);
      const on = doSimAnalysis({ ...base, excludeAdjacent: true }).map((d) => d.label);
      expect(hasAdjacentPair(off)).toBe(true);
      expect(hasAdjacentPair(on)).toBe(false);
      // filtering happens before the top-N cut, so the count is preserved
      expect(on.length).toBe(off.length);
    });

    test(`is ignored when maxInstancesOnly is set (${TraceDomain[domain]})`, () => {
      const a = doSimAnalysis({ ...base, maxInstancesOnly: true }).map((d) => d.label);
      const b = doSimAnalysis({ ...base, maxInstancesOnly: true, excludeAdjacent: true }).map(
        (d) => d.label
      );
      expect(b).toEqual(a);
    });
  }
});
