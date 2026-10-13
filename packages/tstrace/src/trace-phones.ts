import TraceConfig, { TracePhone, TracePhoneRole } from './trace-param';
import * as util from './util';

interface TracePhoneInternal extends TracePhone {
  spreadOffset?: number;
  norm?: number;
  spread?: number[][];
  index?: number;
}

export default class TracePhones {
  private static readonly MAX_STEPS = 9;
  private phonemes: TracePhoneInternal[];
  private ambiguousPhonemes: TracePhoneInternal[] = [];
  /** input-only phonemes from config.inputPhonemes; kept when a continuum is (re)made */
  private extraInputPhonemes: TracePhoneInternal[];
  /** arguments of the last spreadPhons() call, reused by atRate() */
  private spreadArgs?: { spread: number[]; scale: number[]; min: number; max: number };
  private maxspread = 0;

  constructor(private config: TraceConfig) {
    // create a copy of the phonemes
    this.phonemes = config.phonology.map((x: TracePhone): TracePhoneInternal => ({ ...x }));
    this.extraInputPhonemes = (config.inputPhonemes || []).map(
      (x: TracePhone): TracePhoneInternal => ({ ...x, phonologicalRole: TracePhoneRole.AMBIG })
    );
    for (const phon of this.extraInputPhonemes) {
      if (phon.label.length != 1 || this.phonemes.some((p) => p.label == phon.label)) {
        throw new Error(`input phoneme label "${phon.label}" must be one character not used by the phonology`);
      }
    }
    this.ambiguousPhonemes = [...this.extraInputPhonemes];
    // sort the phonemes by label
    this.sortPhonemes();
  }

  /**
   * Sorts the phonemes by the label attribute
   */
  private sortPhonemes() {
    this.phonemes.sort((a, b) => a.label.localeCompare(b.label));
    for (const [idx, phoneme] of this.phonemes.entries()) {
      phoneme.index = idx;
    }
    this.ambiguousPhonemes.sort((a, b) => a.label.localeCompare(b.label));
    for (const [idx, phoneme] of this.ambiguousPhonemes.entries()) {
      phoneme.index = idx;
    }
  }

  public sorted(): TracePhoneInternal[] {
    return this.phonemes;
  }

  public byIndex(index: number): TracePhoneInternal | undefined {
    return this.phonemes[index];
  }

  public byLabel(label: string): TracePhoneInternal | undefined {
    return (
      this.phonemes.find((x) => x.label == label) ||
      this.ambiguousPhonemes.find((x) => x.label == label)
    );
  }

  /**
   * Spreads the phonesmes over time according to the spread array. This
   * should be run before a TraceSim is run, and after any change to the
   * ambiguous phoneme information.
   *
   * @param spread        spread[] in TraceParam
   * @param scale         spreadScale[] in TraceParam
   * @param min           min in TraceParam
   * @param max           max in TraceParam
   */
  public spreadPhons(spread: number[], scale: number[], min: number, max: number) {
    if (spread.length != scale.length) {
      throw new Error('spread and scale parameters have different scale');
    }

    // this appears to be how C trace is implemented.
    min = Math.max(min, 0);
    this.spreadArgs = { spread, scale, min, max };

    // spread offset
    this.maxspread = 0;
    for (const phon of [...this.phonemes, ...this.ambiguousPhonemes]) {
      this.maxspread = Math.max(this.computeSpreadOffset(phon), this.maxspread);
    }

    // spread
    // NOTE: in the code for jTRACE, when it computes the normalization info, the ambiguous phonemes
    // calculation sets the norm value in the corresponding "phonemes" object. i.e., it adds to
    // this.phonemes[n].norm instead of this.ambiguousPhonemes[n].norm. Not sure if this is intentional
    for (const phon of [...this.phonemes, ...this.ambiguousPhonemes]) {
      this.computeSpread(phon, this.maxspread);
    }
  }

  /**
   * A copy of a phoneme stretched in time by `rate` (C TRACE's per-token RATE):
   * its feature ramps are `rate` times as wide. Used for modelInput tokens that
   * set their own rate. spreadPhons() must have been run first.
   */
  public atRate(phon: TracePhoneInternal, rate: number): TracePhoneInternal {
    if (rate === 1) return phon;
    if (!this.spreadArgs) throw new Error('spreadPhons() must run before atRate()');
    const copy: TracePhoneInternal = { ...phon, durationScalar: phon.durationScalar.map((d) => d * rate) };
    const offset = this.computeSpreadOffset(copy);
    this.computeSpread(copy, Math.max(offset, this.maxspread));
    return copy;
  }

  /** Sets phon.spreadOffset (half the widest feature ramp, in slices) and returns it. */
  private computeSpreadOffset(phon: TracePhoneInternal): number {
    const { spread, scale } = this.spreadArgs!;
    let widest = 0;
    phon.spreadOffset = 0;
    for (let i = 0; i < spread.length; i++) {
      const n = spread[i] * scale[i] * phon.durationScalar[0];
      if (n > phon.spreadOffset) {
        phon.spreadOffset = Math.ceil(n);
      }
      widest = Math.max(Math.ceil(n), widest);
    }
    return widest;
  }

  /** Fills phon.spread (each feature's ramp over time) and phon.norm. */
  private computeSpread(phon: TracePhoneInternal, maxspread: number) {
    const { spread, min, max } = this.spreadArgs!;
    phon.spread = util.zeros2D(this.config.numFeatures * this.config.continuaPerFeature, maxspread * 4);
    phon.norm = 0;

    // loop over continuum
    for (let cont = 0; cont < this.config.numFeatures * this.config.continuaPerFeature; cont++) {
      if (phon.features[cont] > 0) {
        const spreadSteps = Math.floor(cont / this.config.numFeatures);

        // delta is the amount to ramp up/down
        const delta =
          (phon.features[cont] * max - phon.features[cont] * min) /
          (spread[spreadSteps] * phon.durationScalar[0]);

        const n = Math.floor(spread[spreadSteps] * phon.durationScalar[0]);
        for (let i = 0; i < n; i++) {
          // compute spread (should these be the same?)
          phon.spread[cont][phon.spreadOffset! + i] = phon.features[cont] * max - delta * i;
          phon.spread[cont][phon.spreadOffset! - i] = phon.spread[cont][phon.spreadOffset! + i];
          // and normalization info
          phon.norm += 2 * Math.pow(phon.spread[cont][phon.spreadOffset! + i], 2);
        }
      }
    }
  }

  /**
   * Create in this object a phoneme continuum of the same format as the
   * phonDefs matricies.
   * Throws an exception if arguments are unreasonable.
   * Be sure to run spreadPhons() after running this!
   *
   * @param from      one endpoint
   * @param to        the other endpoint
   * @param steps     the number of steps (2-9)
   */
  public makePhonemeContinuum(from: string, to: string, steps: number) {
    const phon_from = this.byLabel(from);
    const phon_to = this.byLabel(to);
    if (!phon_from || !phon_to || steps <= 1 || steps > TracePhones.MAX_STEPS) {
      throw new Error('invalid arguments to makePhonemeContinuum');
    }

    const incr_phon = [];
    for (let cont = 0; cont < this.config.numFeatures * this.config.continuaPerFeature; cont++) {
      incr_phon[cont] = (phon_to.features[cont] - phon_from.features[cont]) / (steps - 1);
    }

    const incr_dur = [];
    for (let cont = 0; cont < this.config.continuaPerFeature; cont++) {
      incr_dur[cont] =
        (phon_to.durationScalar[cont] - phon_from.durationScalar[cont]) / (steps - 1);
    }

    // now create the ambiguous phoneme arrays, i.e. the data used to create the phon objects
    this.ambiguousPhonemes = [...this.extraInputPhonemes];
    for (let i = 0; i < steps; i++) {
      // loop over continuoum
      const features: number[] = [];
      for (let cont = 0; cont < this.config.numFeatures * this.config.continuaPerFeature; cont++) {
        // continuum value is calculated as ith step in cont difference between ambigFrom to ambigTo:
        features[cont] = phon_from.features[cont] + i * incr_phon[cont];
      }

      const durationScalar: number[] = [];
      for (let cont = 0; cont < this.config.continuaPerFeature; cont++) {
        // continuum value is calculated as ith step in cont difference between ambigFrom to ambigTo:
        durationScalar[cont] = phon_from.durationScalar[cont] + i * incr_dur[cont];
      }

      // create the ambiguous phoneme
      this.ambiguousPhonemes.push({
        label: i.toString(),
        features,
        durationScalar,
        phonologicalRole: TracePhoneRole.AMBIG,
      });
    }

    // and add the special-purpose question mark segment:
    const midpoint = Math.floor(this.ambiguousPhonemes.length / 2);
    this.ambiguousPhonemes.push({
      label: '?',
      features: [...this.ambiguousPhonemes[midpoint].features],
      durationScalar: [...this.ambiguousPhonemes[midpoint].durationScalar],
      phonologicalRole: TracePhoneRole.AMBIG,
    });

    // sort phonemes
    this.sortPhonemes();
  }
}
