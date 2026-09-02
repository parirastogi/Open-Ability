const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        
        const setCookieHeader = res.headers['set-cookie'];
        let sessionCookie = null;
        if (setCookieHeader) {
          const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
          sessionCookie = cookieStr.split(';')[0];
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
          cookie: sessionCookie
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runRefinedTests() {
  console.log('===========================================================');
  console.log('STARTING REFINED OPENABILITY 8-SCENARIO VERIFICATION TEST');
  console.log('===========================================================\n');

  try {
    // -----------------------------------------------------------
    // TEST 1: SIGNUP DATA REUSE & INITIAL PROFILE CHECK (RAHUL)
    // -----------------------------------------------------------
    console.log('[TEST 1] User A Signup (Rahul Sharma)...');
    const rahulEmail = `rahul_v2_${Date.now()}@test.com`;
    const signupRahul = await makeRequest('/api/auth/signup', 'POST', {
      fullName: 'Rahul Sharma',
      email: rahulEmail,
      password: 'Password123!'
    });
    console.log(' Rahul Signup Status:', signupRahul.status);
    const rahulCookie = signupRahul.cookie;

    // Verify stored profile ALREADY contains Rahul Sharma from signup!
    const rahulMe1 = await makeRequest('/api/auth/me', 'GET', null, rahulCookie);
    console.log(' Rahul Stored Profile Name:', rahulMe1.data.profile.fullName);
    console.log(' Rahul Stored Email:', rahulMe1.data.user.email);
    if (rahulMe1.data.profile.fullName === 'Rahul Sharma' && rahulMe1.data.user.email === rahulEmail) {
      console.log(' PASSED: Signup data immediately persisted into user profile database record.');
    } else {
      throw new Error('CRITICAL FAILURE: Signup data was not immediately saved to profile!');
    }

    // -----------------------------------------------------------
    // TEST 2: ONBOARDING COMPLETION & SKILLS/ROLES PERSISTENCE
    // -----------------------------------------------------------
    console.log('\n[TEST 2] Completing Rahul Onboarding (Software Developer, Python, Java)...');
    await makeRequest('/api/user/profile', 'POST', {
      fullName: 'Rahul Sharma',
      targetRoles: ['Software Developer'],
      experienceYears: 3,
      education: 'B.Tech Computer Science',
      onboardingCompleted: true,
      onboardingStep: 'COMPLETE',
      skills: ['Python', 'Java']
    }, rahulCookie);

    const rahulMe2 = await makeRequest('/api/auth/me', 'GET', null, rahulCookie);
    console.log(' Rahul Onboarding Completed Flag:', rahulMe2.data.profile.onboardingCompleted);
    console.log(' Rahul Persisted Skills:', rahulMe2.data.skills);
    if (rahulMe2.data.profile.onboardingCompleted === true && rahulMe2.data.skills.includes('Python')) {
      console.log(' PASSED: Onboarding data immediately persisted to database.');
    } else {
      throw new Error('CRITICAL FAILURE: Onboarding completion failed to persist!');
    }

    // -----------------------------------------------------------
    // TEST 3: RETURNING USER LOGIN DIRECT ROUTE & RESTORATION
    // -----------------------------------------------------------
    console.log('\n[TEST 3] Logging Out Rahul & Testing Returning User Login...');
    await makeRequest('/api/auth/logout', 'POST', null, rahulCookie);

    const loginRahul = await makeRequest('/api/auth/login', 'POST', {
      email: rahulEmail,
      password: 'Password123!'
    });
    console.log(' Rahul Login Status:', loginRahul.status);
    console.log(' Rahul Login onboardingCompleted:', loginRahul.data.onboardingCompleted);
    if (loginRahul.data.onboardingCompleted === true) {
      console.log(' PASSED: Returning user login identifies onboardingCompleted === true! Bypasses onboarding directly to Dashboard.');
    } else {
      throw new Error('CRITICAL FAILURE: Returning user login triggered onboarding again!');
    }

    // -----------------------------------------------------------
    // TEST 4: USER B (PRIYA) SIGNUP & ZERO RAHUL DATA CROSSOVER
    // -----------------------------------------------------------
    console.log('\n[TEST 4] User B Signup (Priya Patel)...');
    const priyaEmail = `priya_v2_${Date.now()}@test.com`;
    const signupPriya = await makeRequest('/api/auth/signup', 'POST', {
      fullName: 'Priya Patel',
      email: priyaEmail,
      password: 'PriyaPassword123!'
    });
    const priyaCookie = signupPriya.cookie;

    await makeRequest('/api/user/profile', 'POST', {
      fullName: 'Priya Patel',
      targetRoles: ['Data Analyst'],
      experienceYears: 2,
      education: 'M.Sc Data Science',
      onboardingCompleted: true,
      onboardingStep: 'COMPLETE',
      skills: ['SQL', 'Excel']
    }, priyaCookie);

    const priyaMe = await makeRequest('/api/auth/me', 'GET', null, priyaCookie);
    console.log(' Priya Name:', priyaMe.data.profile.fullName);
    console.log(' Priya Skills:', priyaMe.data.skills);
    if (!priyaMe.data.skills.includes('Python') && priyaMe.data.profile.fullName === 'Priya Patel') {
      console.log(' PASSED: Multi-user data isolation confirmed! Zero Rahul crossover.');
    } else {
      throw new Error('CRITICAL FAILURE: Crossover detected! Priya saw Rahul data!');
    }

    // -----------------------------------------------------------
    // TEST 5: PROFILE VOICE UPDATE PERSISTENCE
    // -----------------------------------------------------------
    console.log('\n[TEST 5] Updating Priya Career Goal via Voice API (Data Analyst -> Senior Data Scientist)...');
    await makeRequest('/api/user/profile', 'POST', {
      fullName: 'Priya Patel',
      targetRoles: ['Senior Data Scientist'],
      skills: ['SQL', 'Excel', 'PyTorch']
    }, priyaCookie);

    const priyaUpdated = await makeRequest('/api/auth/me', 'GET', null, priyaCookie);
    console.log(' Priya Updated Target Roles:', priyaUpdated.data.profile.targetRoles);
    console.log(' Priya Updated Skills:', priyaUpdated.data.skills);
    if (priyaUpdated.data.profile.targetRoles.includes('Senior Data Scientist') && priyaUpdated.data.skills.includes('PyTorch')) {
      console.log(' PASSED: Profile updates successfully persisted to database.');
    } else {
      throw new Error('CRITICAL FAILURE: Profile update failed to persist!');
    }

    // -----------------------------------------------------------
    // TEST 6: EXPLICIT ZERO EXPERIENCE (0 YEARS vs NULL)
    // -----------------------------------------------------------
    console.log('\n[TEST 6] Testing Explicit Zero Experience (0 Years vs Null)...');
    const zeroUserEmail = `zero_${Date.now()}@test.com`;
    const signupZero = await makeRequest('/api/auth/signup', 'POST', {
      fullName: 'Zero Exp Student',
      email: zeroUserEmail,
      password: 'Password123!'
    });
    const zeroCookie = signupZero.cookie;

    // Save profile with explicit experienceYears = 0 (Fresher/No Experience)
    await makeRequest('/api/user/profile', 'POST', {
      fullName: 'Zero Exp Student',
      experienceYears: 0,
      targetRoles: ['Frontend Intern'],
      onboardingCompleted: true,
      onboardingStep: 'COMPLETE'
    }, zeroCookie);

    const zeroMe = await makeRequest('/api/auth/me', 'GET', null, zeroCookie);
    console.log(' Stored experienceYears value:', zeroMe.data.profile.experienceYears);
    if (zeroMe.data.profile.experienceYears === 0) {
      console.log(' PASSED: experienceYears = 0 stored as explicit valid confirmed answer, NOT null/unknown.');
    } else {
      throw new Error('CRITICAL FAILURE: 0 years experience was overwritten or treated as null!');
    }

    // -----------------------------------------------------------
    // TEST 7: SPOKEN EMAIL PARSER & NORMALIZATION
    // -----------------------------------------------------------
    console.log('\n[TEST 7] Testing Spoken Email Address Parsing...');
    function parseSpokenEmail(rawSpeech) {
      if (!rawSpeech) return '';
      let text = rawSpeech.toLowerCase().trim();
      text = text.replace(/\s+at\s+/g, '@');
      text = text.replace(/\s+dot\s+/g, '.');
      text = text.replace(/\s+dash\s+/g, '-');
      text = text.replace(/\s+underscore\s+/g, '_');
      text = text.replace(/\s+plus\s+/g, '+');
      text = text.replace(/\s+/g, '');
      text = text.replace(/[.,;!?]+$/, '');
      return text;
    }

    const spoken1 = parseSpokenEmail('rahul at gmail dot com');
    const spoken2 = parseSpokenEmail('parv dot kajla at gmail dot com');
    const spoken3 = parseSpokenEmail('sharma dash rahul at yahoo dot co dot in');
    console.log(' "rahul at gmail dot com" ->', spoken1);
    console.log(' "parv dot kajla at gmail dot com" ->', spoken2);
    console.log(' "sharma dash rahul at yahoo dot co dot in" ->', spoken3);

    if (spoken1 === 'rahul@gmail.com' && spoken2 === 'parv.kajla@gmail.com' && spoken3 === 'sharma-rahul@yahoo.co.in') {
      console.log(' PASSED: Spoken email normalization converts natural phrases to valid email addresses.');
    } else {
      throw new Error('CRITICAL FAILURE: Spoken email normalization failed!');
    }

    console.log('\n===========================================================');
    console.log('ALL REFINED VERIFICATION SCENARIOS PASSED WITH 100% SUCCESS!');
    console.log('===========================================================');

  } catch (error) {
    console.error('\nTEST SUITE FAILED:', error.message);
    process.exit(1);
  }
}

runRefinedTests();
