/**
 * unit_tests.js
 * Comprehensive API unit tests for LocalServe backend
 * Run with: node unit_tests.js
 */

const BASE = 'http://localhost:5002/api';
const TIMESTAMP = Date.now();

const results = [];
let adminToken = '';
let userToken = '';
let workerToken = '';
let createdJobId = '';
let createdUserId = '';
let createdWorkerId = '';

// ---- Helpers ----
async function req(method, url, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${url}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    let data;
    try { data = await res.json(); } catch { data = {}; }
    return { status: res.status, data };
}

function pass(name, note = '') {
    results.push({ test: name, result: 'PASS', note });
}

function fail(name, note = '') {
    results.push({ test: name, result: 'FAIL', note });
}

function check(name, condition, note = '') {
    condition ? pass(name, note) : fail(name, note);
}

// ---- Test Suites ----

async function testAuth() {
    // 1. Register a new user
    const userEmail = `user_${TIMESTAMP}@test.com`;
    let r = await req('POST', '/auth/register', {
        userId: `user_${TIMESTAMP}`,
        name: 'Test User',
        email: userEmail,
        phone: '9876543210',
        password: 'TestPass123!',
        role: 'user',
        location: 'Kochi'
    });
    check('POST /auth/register - Register new user', r.status === 201, `Status: ${r.status}`);
    if (r.data.token) userToken = r.data.token;
    if (r.data.user) createdUserId = r.data.user.id;

    // 2. Register duplicate user (should fail)
    r = await req('POST', '/auth/register', {
        userId: `user_${TIMESTAMP}`,
        name: 'Test User',
        email: userEmail,
        password: 'TestPass123!',
        role: 'user'
    });
    check('POST /auth/register - Duplicate email is rejected', r.status === 409, `Status: ${r.status}`);

    // 3. Register missing required fields
    r = await req('POST', '/auth/register', { email: `partial_${TIMESTAMP}@test.com` });
    check('POST /auth/register - Missing fields rejected', r.status === 400, `Status: ${r.status}`);

    // 4. Login with valid credentials
    r = await req('POST', '/auth/login', { identifier: userEmail, password: 'TestPass123!' });
    check('POST /auth/login - Valid credentials', r.status === 200 && !!r.data.token, `Status: ${r.status}`);
    if (r.data.token) userToken = r.data.token;

    // 5. Login with wrong password
    r = await req('POST', '/auth/login', { identifier: userEmail, password: 'WrongPassword' });
    check('POST /auth/login - Invalid password rejected', r.status === 401, `Status: ${r.status}`);

    // 6. Login with unknown email
    r = await req('POST', '/auth/login', { identifier: 'nobody@nowhere.com', password: 'test' });
    check('POST /auth/login - Unknown user rejected', r.status === 401, `Status: ${r.status}`);

    // 7. Admin login
    r = await req('POST', '/auth/login', { identifier: 'admin@example.com', password: 'admin123' });
    check('POST /auth/login - Admin login succeeds', r.status === 200 && r.data.user?.role === 'admin', `Status: ${r.status}`);
    if (r.data.token) adminToken = r.data.token;

    // 8. Register a worker
    const workerEmail = `worker_${TIMESTAMP}@test.com`;
    r = await req('POST', '/auth/register', {
        userId: `worker_${TIMESTAMP}`,
        name: 'Test Worker',
        email: workerEmail,
        phone: '9876543211',
        password: 'WorkerPass123!',
        role: 'worker',
        location: 'Kochi',
        skills: 'Plumbing',
        availability: 'Mon-Fri',
        serviceType: 'plumber'
    });
    check('POST /auth/register - Register worker', r.status === 201, `Status: ${r.status}`);
    if (r.data.token) workerToken = r.data.token;
    if (r.data.user) createdWorkerId = r.data.user.id;
}

async function testWorkers() {
    // 9. Get all workers/services
    let r = await req('GET', '/services');
    check('GET /services - Fetch all workers', r.status === 200 && Array.isArray(r.data), `Count: ${r.data?.length}`);

    // 10. Get workers by category
    r = await req('GET', '/services?category=plumber');
    check('GET /services?category=plumber - Filter by category', r.status === 200 && Array.isArray(r.data), `Count: ${r.data?.length}`);

    // 11. Get worker dashboard (needs auth)
    r = await req('GET', '/worker/requests', null, workerToken);
    check('GET /worker/requests - Worker dashboard (authenticated)', r.status === 200, `Status: ${r.status}`);

    // 12. Get worker dashboard without auth
    r = await req('GET', '/worker/requests');
    check('GET /worker/requests - Rejected without token', r.status === 401, `Status: ${r.status}`);
}

async function testJobs() {
    // 13. Post a new job (as user)
    let r = await req('POST', '/jobs', {
        title: 'Unit Test Job',
        location: 'Kochi',
        category: 'plumber',
        pay: '₹500/day',
        hours: '8 hours',
        description: 'This is a test job posted by unit tests.',
        date: '2026-04-01'
    }, userToken);
    check('POST /jobs - Create job (as user)', r.status === 201, `Status: ${r.status}`);
    if (r.data._id) createdJobId = r.data._id;

    // 14. Get all jobs
    r = await req('GET', '/jobs');
    check('GET /jobs - Fetch all jobs', r.status === 200 && Array.isArray(r.data), `Count: ${r.data?.length}`);

    // 15. Post job without auth
    r = await req('POST', '/jobs', { title: 'No Auth Job', location: 'Kochi', pay: '200', hours: '4', description: 'x' });
    check('POST /jobs - Rejected without token', r.status === 401, `Status: ${r.status}`);

    // 16. Worker applies to job
    if (createdJobId) {
        r = await req('POST', `/jobs/${createdJobId}/apply`, null, workerToken);
        check('POST /jobs/:id/apply - Worker applies for job', r.status === 200 || r.status === 201, `Status: ${r.status}`);
    } else {
        fail('POST /jobs/:id/apply - Worker applies for job', 'Skipped: no job ID');
    }
}

async function testQuickRequests() {
    // 17. Submit quick request
    let r = await req('POST', '/quick-requests', {
        name: 'Unit Tester',
        contact: '9999999999',
        service: 'Plumber',
        details: 'My pipe is leaking, need urgent fix.'
    });
    check('POST /quick-requests - Submit quick request', r.status === 201, `Status: ${r.status}`);

    // 18. Missing fields
    r = await req('POST', '/quick-requests', { name: 'Only Name' });
    check('POST /quick-requests - Missing fields rejected', r.status === 400, `Status: ${r.status}`);
}

async function testContact() {
    // 19. Submit contact message
    let r = await req('POST', '/contact', {
        name: 'Contact Test',
        email: 'contact@test.com',
        message: 'This is a test help message from unit tests.'
    });
    check('POST /contact - Submit support message', r.status === 201, `Status: ${r.status}`);

    // 20. Missing fields
    r = await req('POST', '/contact', { name: 'No Message' });
    check('POST /contact - Missing fields rejected', r.status === 400, `Status: ${r.status}`);
}

async function testAdminRoutes() {
    // 21. Get all users (admin only)
    let r = await req('GET', '/admin/users', null, adminToken);
    check('GET /admin/users - Admin can get all users', r.status === 200 && Array.isArray(r.data), `Count: ${r.data?.length}`);

    // 22. Get all users without admin token
    r = await req('GET', '/admin/users', null, userToken);
    check('GET /admin/users - Non-admin is rejected (403)', r.status === 403, `Status: ${r.status}`);

    // 23. Get all users without any token
    r = await req('GET', '/admin/users');
    check('GET /admin/users - Rejected without token (401)', r.status === 401, `Status: ${r.status}`);

    // 24. Get all jobs (admin)
    r = await req('GET', '/admin/jobs', null, adminToken);
    check('GET /admin/jobs - Admin can get all jobs', r.status === 200 && Array.isArray(r.data), `Count: ${r.data?.length}`);

    // 25. Get quick requests (admin)
    r = await req('GET', '/admin/quick-requests', null, adminToken);
    check('GET /admin/quick-requests - Admin can get quick requests', r.status === 200 && Array.isArray(r.data), `Count: ${r.data?.length}`);

    // 26. Get contacts (admin)
    r = await req('GET', '/admin/contact', null, adminToken);
    check('GET /admin/contact - Admin can get contact messages', r.status === 200 && Array.isArray(r.data), `Count: ${r.data?.length}`);

    // 27. Admin overview
    r = await req('GET', '/admin/overview', null, adminToken);
    check('GET /admin/overview - Admin overview stats', r.status === 200 && 'usersCount' in r.data, `Status: ${r.status}`);
}

async function testUserDashboard() {
    // 28. User dashboard (authenticated)
    let r = await req('GET', '/user/dashboard', null, userToken);
    check('GET /user/dashboard - User can get their dashboard', r.status === 200, `Status: ${r.status}`);

    // 29. User dashboard without auth
    r = await req('GET', '/user/dashboard');
    check('GET /user/dashboard - Rejected without token', r.status === 401, `Status: ${r.status}`);
}

async function testAdminDelete() {
    // 30. Admin deletes the test user
    if (createdUserId) {
        const r = await req('DELETE', `/admin/users/${createdUserId}`, null, adminToken);
        check('DELETE /admin/users/:id - Admin can delete user', r.status === 200, `Status: ${r.status}`);
    } else {
        fail('DELETE /admin/users/:id - Admin can delete user', 'Skipped: no user ID');
    }

    // 31. Admin tries to delete already-deleted user
    if (createdUserId) {
        const r = await req('DELETE', `/admin/users/${createdUserId}`, null, adminToken);
        check('DELETE /admin/users/:id - Deleting non-existent user returns 404', r.status === 404, `Status: ${r.status}`);
    }
}

// ---- Table Renderer ----
function printTable() {
    const passed = results.filter(r => r.result === 'PASS').length;
    const failed = results.filter(r => r.result === 'FAIL').length;

    const col1 = Math.max(5, ...results.map(r => r.test.length)) + 2;
    const col2 = 8;
    const col3 = Math.max(5, ...results.map(r => r.note.length)) + 2;

    const sep = `+${'-'.repeat(col1)}+${'-'.repeat(col2)}+${'-'.repeat(col3)}+`;
    const row = (t, r, n) => `| ${t.padEnd(col1-2)} | ${r.padEnd(col2-2)} | ${n.padEnd(col3-2)} |`;

    console.log('\n');
    console.log('='.repeat(sep.length));
    console.log('             LOCALSERVE API — UNIT TEST RESULTS');
    console.log('='.repeat(sep.length));
    console.log(sep);
    console.log(row('Test Case', 'Result', 'Note / Status'));
    console.log(sep);
    results.forEach(({ test, result, note }) => {
        console.log(row(test, result === 'PASS' ? '✅ PASS' : '❌ FAIL', note));
    });
    console.log(sep);
    console.log(`\n  Total: ${results.length}  |  Passed: ${passed}  |  Failed: ${failed}`);
    console.log('='.repeat(sep.length));
    console.log('\n');
}

// ---- Main ----
async function runAll() {
    console.log('\n🚀 Starting LocalServe API Unit Tests...\n');
    try {
        await testAuth();
        await testWorkers();
        await testJobs();
        await testQuickRequests();
        await testContact();
        await testAdminRoutes();
        await testUserDashboard();
        await testAdminDelete();
    } catch (err) {
        console.error('Test runner crashed:', err);
    }
    printTable();
}

runAll();
