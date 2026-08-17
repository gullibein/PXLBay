/* All four suites at once.

   They are four separate processes that read the sources and write
   nothing, so there is nothing for them to tread on in each other -
   and run side by side the whole set takes as long as the longest one
   rather than as long as all of them added up.

   The house rule is all four before calling anything done, and this
   changes only how long that takes.  Each suite's output is held and
   printed whole, in the usual order, so the log reads exactly as it
   does when they are run one at a time; anything that fails is
   repeated at the end, and the exit code is non-zero if any did.

       node tests.js            all four
       node tests.js rules      just the ones whose name contains 'rules'

   Run one on its own the old way whenever that is easier - nothing
   here replaces `node test_rules.js`. */
const { spawn } = require('child_process');
const path = require('path');

const SUITES = [
  { name: 'test.js', title: 'the soak' },
  { name: 'test_rules.js', title: 'the rules' },
  { name: 'test_render.js', title: 'what it draws' },
  { name: 'test_sound.js', title: 'what it plays' }
];

const pick = process.argv.slice(2);
const run = pick.length
  ? SUITES.filter(s => pick.some(p => s.name.includes(p)))
  : SUITES;

if (!run.length) {
  console.error('nothing matched: ' + pick.join(' '));
  process.exit(2);
}

const started = Date.now();

const jobs = run.map(s => new Promise(resolve => {
  const t0 = Date.now();
  const child = spawn(process.execPath, [path.join(__dirname, s.name)],
    { cwd: __dirname });
  let out = '';
  child.stdout.on('data', d => { out += d; });
  child.stderr.on('data', d => { out += d; });
  child.on('close', code => {
    resolve({ ...s, out, code, ms: Date.now() - t0 });
  });
}));

Promise.all(jobs).then(results => {
  for (const r of results) {
    console.log('=== ' + r.name + ' - ' + r.title +
      ' (' + (r.ms / 1000).toFixed(1) + 's)');
    process.stdout.write(r.out.endsWith('\n') ? r.out : r.out + '\n');
  }

  const failed = results.filter(r => r.code !== 0);
  const wall = ((Date.now() - started) / 1000).toFixed(1);
  const adds = (results.reduce((a, r) => a + r.ms, 0) / 1000).toFixed(1);
  console.log('--- ' + results.length + ' suites in ' + wall +
    's together, ' + adds + 's one after another');

  if (failed.length) {
    console.log('\nFAILED: ' + failed.map(r => r.name).join(', '));
    process.exit(1);
  }
  console.log('ALL SUITES PASSED');
});
