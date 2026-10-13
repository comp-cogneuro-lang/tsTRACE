import { createDefaultConfig, parseModelInput, TraceNet } from '..';

const build = (input: string, edit: (config: ReturnType<typeof createDefaultConfig>) => void = () => {}) => {
  const config = createDefaultConfig();
  config.modelInput = input;
  edit(config);
  return new TraceNet(config);
};
const center = (net: TraceNet, k: number) => {
  const span = net.getInputPhonemeSpans()[k];
  return (span.start + span.end) / 2;
};
const width = (net: TraceNet, k: number) => {
  const span = net.getInputPhonemeSpans()[k];
  return span.end - span.start + 1;
};

describe('parseModelInput', () => {
  test('reads phonemes, splices, and [strength,rate] suffixes', () => {
    expect(parseModelInput('-b[0.5,2]^{p3b}[0.7]t[,1.5]-')).toEqual([
      { text: '-', strength: 1, rate: 1 },
      { text: 'b', strength: 0.5, rate: 2 },
      { text: '^', strength: 1, rate: 1 },
      { text: '{p3b}', strength: 0.7, rate: 1, splice: { from: 'p', at: 3, to: 'b' } },
      { text: 't', strength: 1, rate: 1.5 },
      { text: '-', strength: 1, rate: 1 },
    ]);
  });

  test('rejects malformed suffixes', () => {
    expect(() => parseModelInput('-b[0.5-')).toThrow();
    expect(() => parseModelInput('-b[x]-')).toThrow();
    expect(() => parseModelInput('-b[1,0]-')).toThrow();
    expect(() => parseModelInput('-b[1,2,3]-')).toThrow();
    expect(() => parseModelInput('-{p3b}[,2]-')).toThrow();
  });
});

describe('per-token strength and rate', () => {
  test('explicit defaults give exactly the plain input', () => {
    const plain = build('-^br^pt-').inputLayer;
    expect(build('-^[1]b[1,1]r^[,1]pt-').inputLayer).toEqual(plain);
  });

  test('strength scales that token only', () => {
    const full = build('-bat-').inputLayer;
    const none = build('-b[0]at-').inputLayer;
    const half = build('-b[0.5]at-').inputLayer;
    // inputs add linearly (nothing here reaches the clamp), so half = midway between none and full
    half.forEach((row, f) => row.forEach((v, t) => expect(v).toBeCloseTo((full[f][t] + none[f][t]) / 2, 10)));
    expect(none).not.toEqual(full);
  });

  test('a phoneme strength in the phonology acts like the same strength on every token', () => {
    const viaPhonology = build('-bab-', (c) => {
      c.phonology = c.phonology.map((p) => (p.label === 'b' ? { ...p, strength: 0.5 } : p));
    }).inputLayer;
    const viaTokens = build('-b[0.5]ab[0.5]-').inputLayer;
    expect(viaPhonology).toEqual(viaTokens);
  });

  test('rate stretches a token and spaces its neighbors by the mean rate', () => {
    const plain = build('-bat-');
    const slow = build('-b[,2]at-');
    expect(width(slow, 1)).toBeGreaterThan(1.8 * width(plain, 1));
    // peaks: silence 6; b 6 + 6 * (1 + 2) / 2 = 15; a 15 + 9 = 24; t 30
    expect(center(slow, 1)).toBeCloseTo(15, 0);
    expect(center(slow, 2)).toBeCloseTo(24, 0);
    expect(center(slow, 3)).toBeCloseTo(30, 0);
  });
});
