export const average = (array: number[]): number => array.reduce((a, b) => a + b) / array.length;

export const zeros2D = (rows: number, cols: number): number[][] =>
  Array.from(Array(rows), (_) => Array(cols).fill(0));

export const zeros3D = (x: number, y: number, z: number): number[][][] =>
  Array.from(Array(x), (_) => {
    return Array.from(Array(y), (_) => Array(z).fill(0));
  });

export const copy2D = (arr: any[][]): any[][] => arr.map((x) => [...x]);

export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);

// seeded PRNG (mulberry32) returning floats in [0, 1), a drop-in for Math.random
export const seededRandom = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const gauss = (mean: number, sd: number, random: () => number = Math.random) => {
  let u = 0,
    v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * sd + mean;
};
