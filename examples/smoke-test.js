// Runs every example end to end on a tiny design (SMOKE=1), writing to a
// temporary folder, so changes to the engine cannot silently break them.
// Plots are made too when python3 with matplotlib, pandas, and scipy is available.
//
// Run:  node examples/smoke-test.js        (~30 s)

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// numbered example folders, here and in the replication subfolders
const numbered = (dir) =>
  fs
    .readdirSync(path.join(__dirname, dir))
    .filter((name) => /^\d\d[a-z]?-/.test(name))
    .sort()
    .map((name) => path.join(dir, name));
const examples = [...numbered(''), ...numbered('original-trace-replications'), ...numbered('mcclelland-1991'), ...numbered('dahan-2001')];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tstrace-examples-'));
const hasPython = spawnSync('python3', ['-c', 'import matplotlib, pandas, scipy'], { stdio: 'ignore' }).status === 0;
let failures = 0;

for (const name of examples) {
  const dir = path.join(__dirname, name);
  const out = path.join(tmp, name);
  const steps = [['node', [path.join(dir, 'simulate.js'), out], { SMOKE: '1' }]];
  if (hasPython) steps.push(['python3', [path.join(dir, 'plot.py'), out, path.join(out, 'figures')], { MPLCONFIGDIR: tmp }]);
  for (const [cmd, args, env] of steps) {
    const r = spawnSync(cmd, args, { env: { ...process.env, ...env }, encoding: 'utf8' });
    const ok = r.status === 0;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} ${cmd === 'node' ? 'simulate' : 'plot'}`);
    if (!ok) {
      failures++;
      console.log(r.stdout, r.stderr);
    }
  }
}
if (!hasPython) console.log('(python3 with matplotlib, pandas, scipy not found: plots skipped)');
console.log(failures ? `${failures} step(s) failed; output in ${tmp}` : `all examples ran; output in ${tmp}`);
process.exitCode = failures ? 1 : 0;
