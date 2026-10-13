// Stimuli for the close replication of Allopenna, Magnuson & Tanenhaus (1998),
// Experiment 1 (their Table 1), written in TRACE's 14 phonemes.
//
// The paper does not give its TRACE transcriptions. These follow the convention
// of jTRACE's lexicons (syllabic /r/ and /l/ written without a schwa, as in
// bikr "beaker", bitl "beetle", dalr "dollar", kalr "collar", piktr "picture",
// which appear there), and map sounds TRACE lacks to the nearest phoneme it has:
//   vowels  i, I -> i;  ae, A -> a;  E, schwa, ^ -> ^;  u -> u
//   n -> d,  f -> p,  w -> u,  ch -> S,  dzh -> d,  h -> (dropped),  th (voiced) -> d
// Edit this table to try other transcriptions.

const TRANSCRIPTIONS = {
  beaker: 'bikr',
  beetle: 'bitl',
  speaker: 'spikr',
  dolphin: 'dalpid',
  carrot: 'kar^t',
  carriage: 'karid',
  parrot: 'par^t',
  nickel: 'dikl',
  candle: 'kaddl',
  candy: 'kaddi',
  handle: 'addl',
  dollar: 'dalr',
  pickle: 'pikl',
  picture: 'piktr',
  casket: 'kask^t',
  castle: 'kasl',
  basket: 'bask^t',
  paddle: 'padl',
  padlock: 'padlak',
  saddle: 'sadl',
  collar: 'kalr',
  sandal: 'saddl',
  sandwich: 'sadduiS',
};

// "the", which preceded every referent ("pick up the ...")
const CARRIER = 'd^';

// Table 1: referent, onset cohort, rhyme, unrelated
const SETS = [
  ['beaker', 'beetle', 'speaker', 'dolphin'],
  ['carrot', 'carriage', 'parrot', 'nickel'],
  ['candle', 'candy', 'handle', 'dollar'],
  ['pickle', 'picture', 'nickel', 'speaker'],
  ['casket', 'castle', 'basket', 'nickel'],
  ['paddle', 'padlock', 'saddle', 'dollar'],
  ['dollar', 'dolphin', 'collar', 'beaker'],
  ['sandal', 'sandwich', 'candle', 'parrot'],
];
const ROLES = ['referent', 'cohort', 'rhyme', 'unrelated'];

// The paper's lexicon added each item's neighbors (words differing by one
// phoneme), found with the Wordprobe utility, which is no longer available.
// These are the one-phoneme neighbors of the transcriptions above that occur in
// jTRACE's 901-word lexicon (biglex901), which is written in TRACE phonemes.
const NEIGHBORS = [
  'batl', 'bidl', 'bit', 'butl', 'dal', 'dali', 'dalr', 'daplr', 'dasl', 'dil', 'dilr',
  'k^lr', 'kablr', 'kadl', 'kali', 'kalr', 'kalr^', 'kapr', 'kar', 'kard', 'karp^t',
  'kart', 'kasi', 'katr', 'kilr', 'krid', 'kulr', 'p^dl', 'pad', 'part', 'pik', 'pikt',
  'pil', 'pipl', 'pitr', 'pudl', 'sad', 'sadi', 'sadr', 'sal', 'sikr', 'skalr', 'spik',
];

module.exports = { TRANSCRIPTIONS, CARRIER, SETS, ROLES, NEIGHBORS };
