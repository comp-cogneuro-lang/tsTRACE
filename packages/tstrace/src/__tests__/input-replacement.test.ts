import { createDefaultConfig, TraceNet } from '..';

const ROWS = 63;

const build = (edit: (config: ReturnType<typeof createDefaultConfig>) => void = () => {}) => {
  const config = createDefaultConfig();
  edit(config);
  return new TraceNet(config);
};

const column = (net: TraceNet, slice: number) => net.inputLayer.map((row) => row[slice]);
const flat = (rows: number[][]): number[] => ([] as number[]).concat(...rows);

describe('input phoneme spans', () => {
  const spans = build().getInputPhonemeSpans();

  test('one span per input phoneme, in order', () => {
    expect(spans.map((s) => s.label).join('')).toBe('-^br^pt-');
  });

  test('each span covers exactly the slices its phoneme adds input to', () => {
    // building the input with one phoneme swapped for a different one changes the input
    // only inside (the union of) that phoneme's spans
    const clean = build().inputLayer;
    for (const [k, span] of spans.entries()) {
      if (k === 0 || k === spans.length - 1) continue; // silence edges
      const alt = build((c) => {
        const chars = c.modelInput.split('');
        chars[k] = chars[k] === 'a' ? 'i' : 'a';
        c.modelInput = chars.join('');
      });
      const altSpan = alt.getInputPhonemeSpans()[k];
      for (let t = 0; t < clean[0].length; t++) {
        const changed = clean.some((row, f) => row[t] !== alt.inputLayer[f][t]);
        const inside = (t >= span.start && t <= span.end) || (t >= altSpan.start && t <= altSpan.end);
        if (changed) expect(inside).toBe(true);
      }
    }
  });

  test('phoneme k is centered near slice deltaInput * (k + 1)', () => {
    for (const [k, span] of spans.entries()) {
      const center = (span.start + span.end) / 2;
      expect(Math.abs(center - 6 * (k + 1))).toBeLessThanOrEqual(1);
    }
  });
});

describe('input replacement', () => {
  test('off by default', () => {
    expect(build().inputLayer).toEqual(
      build((c) => {
        c.replaceSD = 0.5;
        c.replaceMean = 0.3;
      }).inputLayer
    );
  });

  test('SD 0 and mean 0 gives zeros in the range and leaves the rest alone', () => {
    const clean = build();
    const net = build((c) => {
      c.replaceStart = 10;
      c.replaceEnd = 20;
    });
    for (let t = 0; t < 99; t++) {
      if (t >= 10 && t <= 20) expect(column(net, t)).toEqual(Array(ROWS).fill(0));
      else expect(column(net, t)).toEqual(column(clean, t));
    }
  });

  test('SD 0 with a mean gives that constant', () => {
    const net = build((c) => {
      c.replaceStart = 10;
      c.replaceEnd = 12;
      c.replaceMean = 0.4;
    });
    expect(column(net, 11)).toEqual(Array(ROWS).fill(0.4));
  });

  test('SD > 0 gives noise with roughly the requested mean and SD', () => {
    const net = build((c) => {
      c.replaceStart = 0;
      c.replaceEnd = 98;
      c.replaceMean = 0.5;
      c.replaceSD = 0.1;
      c.seed = 1;
    });
    const values = flat(net.inputLayer);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
    expect(mean).toBeCloseTo(0.5, 2);
    expect(sd).toBeCloseTo(0.1, 2);
  });

  test('replacement is clamped to [min, max] and clipped to the input', () => {
    const net = build((c) => {
      c.replaceStart = -5;
      c.replaceEnd = 500;
      c.replaceMean = 5;
    });
    expect(flat(net.inputLayer).every((v) => v === 1)).toBe(true);
  });

  test('seeded replacement noise is repeatable', () => {
    const make = () =>
      build((c) => {
        c.replaceStart = 10;
        c.replaceEnd = 20;
        c.replaceSD = 0.3;
        c.seed = 5;
      }).inputLayer;
    expect(make()).toEqual(make());
  });
});
