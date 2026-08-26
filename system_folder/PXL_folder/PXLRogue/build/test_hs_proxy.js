/**
 * Test suite for PXLRogue High Score Serverless Proxy & Anti-Cheat Validation
 */
const {
  E_LEVELS,
  HS_MAX,
  HS_NAME_MAX,
  MAX_LEVEL,
  MAX_DEPTH,
  MAX_SUBMISSIONS_PER_HOUR,
  hsName,
  hsClean,
  hsWith,
  validateXpMatchesLevel,
  validateScoreSubmission,
  checkRateLimit,
  handleRequest,
  CORS_HEADERS
} = require('../serverless/scores_service.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    failed++;
  } else {
    passed++;
  }
}

async function runTests() {
  console.log('--- Testing High Score Proxy & Validation Service ---');

  // 1. E_LEVELS & XP-to-Level validation tests
  console.log('1. Testing E_LEVELS & Level-to-XP matching...');

  // Level 1: [0, 15)
  assert(validateXpMatchesLevel(0, 1), 'Level 1 with 0 XP should be valid');
  assert(validateXpMatchesLevel(14, 1), 'Level 1 with 14 XP should be valid');
  assert(!validateXpMatchesLevel(15, 1), 'Level 1 with 15 XP must be invalid (should be lvl 2)');
  assert(!validateXpMatchesLevel(-1, 1), 'Level 1 with negative XP must be invalid');

  // Level 2: [15, 37)
  assert(validateXpMatchesLevel(15, 2), 'Level 2 with 15 XP should be valid');
  assert(validateXpMatchesLevel(36, 2), 'Level 2 with 36 XP should be valid');
  assert(!validateXpMatchesLevel(14, 2), 'Level 2 with 14 XP must be invalid');
  assert(!validateXpMatchesLevel(37, 2), 'Level 2 with 37 XP must be invalid (should be lvl 3)');

  // Level 5: [292, 529) (E_LEVELS[3] to E_LEVELS[4])
  assert(validateXpMatchesLevel(292, 5), 'Level 5 with 292 XP should be valid');
  assert(validateXpMatchesLevel(528, 5), 'Level 5 with 528 XP should be valid');
  assert(!validateXpMatchesLevel(291, 5), 'Level 5 with 291 XP must be invalid');
  assert(!validateXpMatchesLevel(529, 5), 'Level 5 with 529 XP must be invalid');

  // Level 20: [343832, 430700) (E_LEVELS[18] to E_LEVELS[19])
  assert(validateXpMatchesLevel(343832, 20), 'Level 20 with 343832 XP should be valid');
  assert(validateXpMatchesLevel(430699, 20), 'Level 20 with 430699 XP should be valid');
  assert(!validateXpMatchesLevel(343831, 20), 'Level 20 with 343831 XP must be invalid');
  assert(!validateXpMatchesLevel(430700, 20), 'Level 20 with 430700 XP must be invalid (should be lvl 21)');

  // Level 21 (Cap): >= 430700
  assert(validateXpMatchesLevel(430700, 21), 'Level 21 with 430700 XP should be valid');
  assert(validateXpMatchesLevel(999999, 21), 'Level 21 with 999999 XP should be valid');
  assert(!validateXpMatchesLevel(430699, 21), 'Level 21 with 430699 XP must be invalid');

  // Boundary levels
  assert(!validateXpMatchesLevel(0, 0), 'Level 0 must be invalid');
  assert(!validateXpMatchesLevel(500000, 22), 'Level 22 (> 21) must be invalid');
  assert(!validateXpMatchesLevel('50', 2), 'String XP must be invalid');

  // 2. Full score submission validation
  console.log('2. Testing score submission validation...');
  
  // Valid run
  const v1 = validateScoreSubmission({ name: 'Gulli', xp: 50, level: 3, depth: 2, turns: 30 });
  assert(v1.ok === true, 'Valid submission should pass validation');
  assert(v1.entry.name === 'Gulli', 'Name sanitized correctly');
  assert(v1.entry.xp === 50 && v1.entry.level === 3, 'XP & Level preserved');

  // Max depth check
  const vDepthOK = validateScoreSubmission({ name: 'Gulli', xp: 450000, level: 21, depth: 26, turns: 6000 });
  assert(vDepthOK.ok === true, 'Dungeon depth 26 should be accepted');

  const vDepthBad = validateScoreSubmission({ name: 'Gulli', xp: 450000, level: 21, depth: 27, turns: 6000 });
  assert(vDepthBad.ok === false, 'Dungeon depth 27 (> 26) must be rejected');

  const vDepthZero = validateScoreSubmission({ name: 'Gulli', xp: 5, level: 1, depth: 0, turns: 10 });
  assert(vDepthZero.ok === false, 'Dungeon depth 0 must be rejected');

  // Turn plausibility check
  const vTurnsLowForDepth = validateScoreSubmission({ name: 'Gulli', xp: 5, level: 1, depth: 10, turns: 2 });
  assert(vTurnsLowForDepth.ok === false, 'Depth 10 with 2 turns must be rejected');

  const vTurnsLowForXp = validateScoreSubmission({ name: 'Gulli', xp: 50000, level: 15, depth: 15, turns: 20 });
  assert(vTurnsLowForXp.ok === false, '50,000 XP with only 20 turns must be rejected as implausible');

  const vTurnsNegative = validateScoreSubmission({ name: 'Gulli', xp: 5, level: 1, depth: 1, turns: -5 });
  assert(vTurnsNegative.ok === false, 'Negative turn count must be rejected');

  // Name sanitization
  const vNameClean = validateScoreSubmission({ name: '  <!#$@>Hero#1!@  ', xp: 0, level: 1, depth: 1, turns: 0 });
  assert(vNameClean.ok === true && vNameClean.entry.name === 'Hero1', 'Special characters and spaces stripped from name');

  const vNameLong = validateScoreSubmission({ name: 'SuperLongPlayerNameExceedingMax', xp: 0, level: 1, depth: 1, turns: 0 });
  assert(vNameLong.ok === true && vNameLong.entry.name.length === HS_NAME_MAX, 'Name truncated to HS_NAME_MAX (12)');

  // 3. Rate limiting check
  console.log('3. Testing hourly rate limiter...');
  const testIp = '192.168.1.100';
  const now = Date.now();
  
  let rateLimitPassedCount = 0;
  for (let i = 0; i < MAX_SUBMISSIONS_PER_HOUR; i++) {
    if (checkRateLimit(testIp, now + i * 10)) {
      rateLimitPassedCount++;
    }
  }
  assert(rateLimitPassedCount === MAX_SUBMISSIONS_PER_HOUR, `${MAX_SUBMISSIONS_PER_HOUR} submissions within the hour should succeed`);
  
  const blockedRequest = checkRateLimit(testIp, now + 1000);
  assert(!blockedRequest, `The ${MAX_SUBMISSIONS_PER_HOUR + 1}th submission within the hour must be blocked`);

  // Another IP should not be blocked
  assert(checkRateLimit('192.168.1.101', now + 1000), 'Different IP address should not be affected by rate limit');

  // 4. Request handler tests (GET, POST, OPTIONS)
  console.log('4. Testing handleRequest (GET, POST, OPTIONS)...');

  // OPTIONS (CORS preflight)
  const optionsReq = new Request('https://proxy.test/api/scores', { method: 'OPTIONS' });
  const optionsRes = await handleRequest(optionsReq);
  assert(optionsRes.status === 204, 'OPTIONS request should return status 204');
  assert(optionsRes.headers.get('Access-Control-Allow-Origin') === '*', 'CORS Allow-Origin header present');

  // Mock global fetch for jsonbin simulation
  const mockDb = [
    { name: 'Rodney', xp: 10500, level: 12 },
    { name: 'Anband', xp: 8200, level: 9 },
    { name: 'NetHack', xp: 7500, level: 8 }
  ];

  const originalFetch = global.fetch;
  global.fetch = async (url, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'GET') {
      return {
        ok: true,
        status: 200,
        json: async () => ({ record: mockDb })
      };
    }
    if (method === 'PUT') {
      const data = JSON.parse(opts.body);
      mockDb.length = 0;
      mockDb.push(...data);
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ record: mockDb })
      };
    }
    return { ok: false, status: 404 };
  };

  try {
    // GET test
    const getReq = new Request('https://proxy.test/api/scores', { method: 'GET' });
    const getRes = await handleRequest(getReq, { HS_KEY: 'test-secret-key' });
    assert(getRes.status === 200, 'GET request returns status 200');
    const getBody = await getRes.json();
    assert(Array.isArray(getBody) && getBody.length === 3, 'GET returned array of scores');
    assert(getBody[0].name === 'Rodney', 'Scores sorted correctly');

    // POST test with invalid score (bad level/XP)
    const postBadReq = new Request('https://proxy.test/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Cheater', xp: 999999, level: 1, depth: 1, turns: 5 })
    });
    const postBadRes = await handleRequest(postBadReq, { HS_KEY: 'test-secret-key' });
    assert(postBadRes.status === 400, 'POST with forged XP/Level returns 400 Bad Request');

    // POST test with valid score (Level 12 with 9000 XP is in range [7459, 11784))
    const postGoodReq = new Request('https://proxy.test/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.1'
      },
      body: JSON.stringify({ name: 'Hero', xp: 9000, level: 12, depth: 10, turns: 800 })
    });
    const postGoodRes = await handleRequest(postGoodReq, { HS_KEY: 'test-secret-key' });
    assert(postGoodRes.status === 200, 'POST with valid score returns 200 OK');
    const postGoodBody = await postGoodRes.json();
    assert(postGoodBody.success === true, 'Score successfully added to leaderboard');
    assert(mockDb.some(e => e.name === 'Hero' && e.xp === 9000), 'Score persisted to database');
  } finally {
    global.fetch = originalFetch;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
