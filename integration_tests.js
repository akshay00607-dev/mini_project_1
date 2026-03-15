/**
 * integration_tests.js
 * Integration tests for LocalServe — tests complete end-to-end user flows
 * Tests how multiple components work together across multiple API calls
 * Run with: node integration_tests.js
 */

const BASE = 'http://localhost:5002/api';
const TS = Date.now();

const results = [];

// ── Helpers ──────────────────────────────────────────────────────────────────
async function api(method, url, body, token) {
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

function check(flow, step, pass, detail = '') {
    results.push({ flow, step, result: pass ? '✅ PASS' : '❌ FAIL', detail });
    if (!pass) console.error(`  ❌ FAIL [${flow}] ${step} — ${detail}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 1: User Registration → Login → View Dashboard
// ─────────────────────────────────────────────────────────────────────────────
async function flow_UserRegistrationAndDashboard() {
    const FLOW = 'Flow 1: User Registration & Dashboard';
    const email = `integ_user_${TS}@test.com`;
    let userToken, userId;

    // Step 1: Register
    let r = await api('POST', '/auth/register', {
        userId: `integ_user_${TS}`,
        name: 'Integration User',
        email,
        phone: '9000000001',
        password: 'IntegPass@1',
        role: 'user',
        location: 'Kochi'
    });
    check(FLOW, 'Register new user (201)', r.status === 201, `HTTP ${r.status}`);
    userToken = r.data.token;
    userId = r.data.user?.id;

    // Step 2: Login with the same credentials
    r = await api('POST', '/auth/login', { identifier: email, password: 'IntegPass@1' });
    check(FLOW, 'Login returns token (200)', r.status === 200 && !!r.data.token, `HTTP ${r.status}`);
    userToken = r.data.token ?? userToken;

    // Step 3: Access user dashboard right after login
    r = await api('GET', '/user/dashboard', null, userToken);
    check(FLOW, 'Dashboard is accessible after login (200)', r.status === 200, `HTTP ${r.status}`);
    check(FLOW, 'Dashboard has directBookings array', Array.isArray(r.data.directBookings), `keys: ${Object.keys(r.data).join(', ')}`);
    check(FLOW, 'Dashboard has postedJobs array', Array.isArray(r.data.postedJobs), `keys: ${Object.keys(r.data).join(', ')}`);

    return { userToken, userId, userEmail: email };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 2: Worker Registration → Login → View Worker Dashboard
// ─────────────────────────────────────────────────────────────────────────────
async function flow_WorkerRegistration() {
    const FLOW = 'Flow 2: Worker Registration & Dashboard';
    const email = `integ_worker_${TS}@test.com`;
    let workerToken, workerId;

    // Step 1: Register as worker
    let r = await api('POST', '/auth/register', {
        userId: `integ_worker_${TS}`,
        name: 'Integration Worker',
        email,
        phone: '9000000002',
        password: 'WorkerPass@1',
        role: 'worker',
        location: 'Kochi',
        skills: 'Plumbing, Pipe Repair',
        availability: 'Mon-Sat',
        serviceType: 'plumber'
    });
    check(FLOW, 'Worker registration succeeds (201)', r.status === 201, `HTTP ${r.status}`);
    workerToken = r.data.token;
    workerId = r.data.user?.id;

    // Step 2: Worker appears in services list
    r = await api('GET', '/services?category=plumber');
    const found = Array.isArray(r.data) && r.data.some(w => w.email === email);
    check(FLOW, 'Newly registered worker appears in /services list', found, `Worker in list: ${found}`);

    // Step 3: Worker can access their own dashboard
    r = await api('GET', '/worker/requests', null, workerToken);
    check(FLOW, 'Worker dashboard accessible (200)', r.status === 200, `HTTP ${r.status}`);
    check(FLOW, 'Worker dashboard contains quickRequests', Array.isArray(r.data.quickRequests), `keys: ${Object.keys(r.data).join(', ')}`);
    check(FLOW, 'Worker dashboard contains directBookings', Array.isArray(r.data.directBookings), `keys: ${Object.keys(r.data).join(', ')}`);

    return { workerToken, workerId, workerEmail: email };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 3: User Books a Worker → Worker Accepts → Worker Completes
// ─────────────────────────────────────────────────────────────────────────────
async function flow_BookWorkerFlow(userToken, workerToken, workerId) {
    const FLOW = 'Flow 3: Book Worker → Accept → Complete';

    // Step 1: User books the worker
    let r = await api('POST', `/worker/${workerId}/book`, {
        details: 'My kitchen sink is leaking badly. Need urgent fix.',
        userContact: '9000000001'
    }, userToken);
    check(FLOW, 'User books worker successfully (200/201)', r.status === 200 || r.status === 201, `HTTP ${r.status}`);
    // API returns { message, booking } — extract the nested booking object
    const bookingObj = r.data.booking ?? r.data;
    const bookingId = bookingObj._id || bookingObj.id;

    // Step 2: Booking appears in user's dashboard
    r = await api('GET', '/user/dashboard', null, userToken);
    const userBookings = r.data.directBookings ?? [];
    const userHasBooking = userBookings.some(b => (b._id || b.id) === bookingId);
    check(FLOW, 'Booking appears in user dashboard', userHasBooking, `Bookings: ${userBookings.length}`);

    // Step 3: Booking appears in worker's dashboard with 'Requested' status
    r = await api('GET', '/worker/requests', null, workerToken);
    const workerBookings = r.data.directBookings ?? [];
    const workerSees = workerBookings.find(b => (b._id || b.id) === bookingId);
    check(FLOW, 'Booking appears in worker dashboard', !!workerSees, `Worker bookings: ${workerBookings.length}`);
    check(FLOW, "Booking status is 'Requested'", workerSees?.status === 'Requested' || workerSees?.status === 'Pending', `Status: ${workerSees?.status}`);

    // Step 4: Worker accepts the booking
    r = await api('PUT', `/worker/booking/${bookingId}/status`, { status: 'Accepted' }, workerToken);
    check(FLOW, 'Worker accepts booking (200)', r.status === 200, `HTTP ${r.status}`);

    // Step 5: Booking now shows 'Accepted'
    r = await api('GET', '/worker/requests', null, workerToken);
    const accepted = r.data.directBookings?.find(b => (b._id || b.id) === bookingId);
    check(FLOW, "Booking status updates to 'Accepted'", accepted?.status === 'Accepted', `Status: ${accepted?.status}`);

    // Step 6: Worker marks booking as completed
    r = await api('PUT', `/worker/booking/${bookingId}/status`, { status: 'Completed' }, workerToken);
    check(FLOW, 'Worker marks booking as Completed (200)', r.status === 200, `HTTP ${r.status}`);

    // Step 7: Confirm final status is Completed
    r = await api('GET', '/worker/requests', null, workerToken);
    const completed = r.data.directBookings?.find(b => (b._id || b.id) === bookingId);
    check(FLOW, "Final booking status is 'Completed'", completed?.status === 'Completed', `Status: ${completed?.status}`);

    return bookingId;
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 4: User Posts a Job → Worker Applies → User Accepts Worker
// ─────────────────────────────────────────────────────────────────────────────
async function flow_JobPostAndApply(userToken, workerToken, workerId) {
    const FLOW = 'Flow 4: Post Job → Worker Applies → User Accepts';

    // Step 1: User posts a job
    let r = await api('POST', '/jobs', {
        title: `Integration Test Job ${TS}`,
        location: 'Kochi',
        category: 'plumber',
        pay: '₹600/day',
        hours: '6 hours',
        description: 'Fix the water pump and check all connections.',
        date: '2026-05-01'
    }, userToken);
    check(FLOW, 'User posts job (201)', r.status === 201, `HTTP ${r.status}`);
    const jobId = r.data._id || r.data.id;

    // Step 2: Job appears in public list
    r = await api('GET', '/jobs');
    const isPublic = Array.isArray(r.data) && r.data.some(j => (j._id || j.id) === jobId);
    check(FLOW, 'Job is visible in public job listing', isPublic, `Jobs listed: ${r.data?.length}`);

    // Step 3: Job appears in user's dashboard
    r = await api('GET', '/user/dashboard', null, userToken);
    const userJob = r.data.postedJobs?.find(j => (j._id || j.id) === jobId);
    check(FLOW, "Job appears in user dashboard postedJobs", !!userJob, `Posted jobs: ${r.data.postedJobs?.length}`);
    check(FLOW, "Job initial status is 'Open'", userJob?.status === 'Open', `Status: ${userJob?.status}`);

    // Step 4: Worker applies for the job
    r = await api('POST', `/jobs/${jobId}/apply`, null, workerToken);
    check(FLOW, 'Worker applies for job (200)', r.status === 200 || r.status === 201, `HTTP ${r.status}`);

    // Step 5: Application appears in user's dashboard
    r = await api('GET', '/user/dashboard', null, userToken);
    const updatedJob = r.data.postedJobs?.find(j => (j._id || j.id) === jobId);
    check(FLOW, 'Application shows up in user dashboard', (updatedJob?.applications?.length ?? 0) > 0, `Apps: ${updatedJob?.applications?.length}`);

    // Step 6: User selects/accepts the worker
    r = await api('POST', `/jobs/${jobId}/select-worker`, { workerId }, userToken);
    check(FLOW, 'User selects worker for job (200)', r.status === 200, `HTTP ${r.status}`);

    // Step 7: Job status is no longer Open
    r = await api('GET', '/user/dashboard', null, userToken);
    const finalJob = r.data.postedJobs?.find(j => (j._id || j.id) === jobId);
    check(FLOW, "Job status changes after worker acceptance", finalJob?.status !== 'Open', `Status: ${finalJob?.status}`);

    return jobId;
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 5: Quick Request → Appears in Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────
async function flow_QuickRequestToAdmin(adminToken) {
    const FLOW = 'Flow 5: Quick Request → Admin Dashboard';

    // Step 1: Get initial count
    let r = await api('GET', '/admin/quick-requests', null, adminToken);
    const before = (r.data ?? []).length;

    // Step 2: Submit a quick request
    r = await api('POST', '/quick-requests', {
        name: 'Integration Customer',
        contact: '9000000099',
        service: 'Electrician',
        details: 'Power outage in bedroom area, need urgent check.'
    });
    check(FLOW, 'Quick request submitted successfully (201)', r.status === 201, `HTTP ${r.status}`);
    const qrId = r.data._id || r.data.id;

    // Step 3: Quick request immediately visible in admin panel
    r = await api('GET', '/admin/quick-requests', null, adminToken);
    const after = (r.data ?? []).length;
    check(FLOW, 'Quick request count increases in admin panel', after > before, `Before: ${before}, After: ${after}`);

    // Step 4: Admin can find the specific request
    const found = r.data.some(q => (q._id || q.id) === qrId);
    check(FLOW, 'Admin can find the specific quick request', found, `Found: ${found}`);

    // Step 5: Admin deletes the quick request
    r = await api('DELETE', `/admin/quick-requests/${qrId}`, null, adminToken);
    check(FLOW, 'Admin deletes quick request (200)', r.status === 200, `HTTP ${r.status}`);

    // Step 6: Quick request no longer in admin panel
    r = await api('GET', '/admin/quick-requests', null, adminToken);
    const afterDelete = r.data.some(q => (q._id || q.id) === qrId);
    check(FLOW, 'Quick request removed from admin panel after delete', !afterDelete, `Still present: ${afterDelete}`);

    return qrId;
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 6: Contact Form → Appears in Admin Dashboard → Admin Deletes
// ─────────────────────────────────────────────────────────────────────────────
async function flow_ContactToAdmin(adminToken) {
    const FLOW = 'Flow 6: Contact Message → Admin Dashboard → Delete';

    // Step 1: Get initial count
    let r = await api('GET', '/admin/contact', null, adminToken);
    const before = (r.data ?? []).length;

    // Step 2: Submit contact message
    r = await api('POST', '/contact', {
        name: 'Integration Help Seeker',
        email: `help_${TS}@test.com`,
        message: 'I cannot login to the platform. Please help me reset my account.'
    });
    check(FLOW, 'Contact message submitted successfully (201)', r.status === 201, `HTTP ${r.status}`);
    const contactId = r.data._id || r.data.id;

    // Step 3: Message appears in admin panel
    r = await api('GET', '/admin/contact', null, adminToken);
    const after = (r.data ?? []).length;
    check(FLOW, 'Contact count increases in admin panel', after > before, `Before: ${before}, After: ${after}`);

    // Step 4: Admin finds specific message
    const found = r.data.some(c => (c._id || c.id) === contactId);
    check(FLOW, 'Admin can find the specific contact message', found, `Found: ${found}`);

    // Step 5: Admin deletes the message
    r = await api('DELETE', `/admin/contact/${contactId}`, null, adminToken);
    check(FLOW, 'Admin deletes contact message (200)', r.status === 200, `HTTP ${r.status}`);

    // Step 6: Message gone from admin panel
    r = await api('GET', '/admin/contact', null, adminToken);
    const afterDelete = r.data.some(c => (c._id || c.id) === contactId);
    check(FLOW, 'Contact message removed from admin panel after delete', !afterDelete, `Still present: ${afterDelete}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 7: Admin Cascade Delete — User Deleted, Their Data Cleaned Up
// ─────────────────────────────────────────────────────────────────────────────
async function flow_AdminCascadeDelete(adminToken) {
    const FLOW = 'Flow 7: Admin Cascade Delete User';
    const email = `cascade_user_${TS}@test.com`;

    // Step 1: Register a user
    let r = await api('POST', '/auth/register', {
        userId: `cascade_${TS}`,
        name: 'Cascade Test User',
        email,
        phone: '9000000003',
        password: 'Cascade@Pass1',
        role: 'user',
        location: 'Chennai'
    });
    check(FLOW, 'Test user registered for cascade test (201)', r.status === 201, `HTTP ${r.status}`);
    const userId = r.data.user?.id;
    const userToken = r.data.token;

    // Step 2: User posts a job
    r = await api('POST', '/jobs', {
        title: `Cascade Test Job ${TS}`,
        location: 'Chennai',
        category: 'cleaning',
        pay: '₹300/day',
        hours: '3 hours',
        description: 'Deep clean my apartment.'
    }, userToken);
    check(FLOW, 'User posts a job (201)', r.status === 201, `HTTP ${r.status}`);

    // Step 3: Admin deletes the user
    r = await api('DELETE', `/admin/users/${userId}`, null, adminToken);
    check(FLOW, 'Admin deletes user (200)', r.status === 200, `HTTP ${r.status}`);

    // Step 4: Deleted user cannot login anymore
    r = await api('POST', '/auth/login', { identifier: email, password: 'Cascade@Pass1' });
    check(FLOW, 'Deleted user cannot log in (401)', r.status === 401, `HTTP ${r.status}`);

    // Step 5: User no longer appears in admin users list
    r = await api('GET', '/admin/users', null, adminToken);
    const stillExists = r.data.some(u => u._id === userId || u.id === userId);
    check(FLOW, 'User no longer in admin user list', !stillExists, `Still exists: ${stillExists}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 8: Security — Cross-Role Access Control
// ─────────────────────────────────────────────────────────────────────────────
async function flow_SecurityAccessControl(userToken, workerToken) {
    const FLOW = 'Flow 8: Security & Role-Based Access Control';

    // User tries to access worker-only routes
    let r = await api('GET', '/worker/requests', null, userToken);
    check(FLOW, 'User cannot access worker-only dashboard (403)', r.status === 403, `HTTP ${r.status}`);

    // Worker tries to access user-only routes
    r = await api('GET', '/user/dashboard', null, workerToken);
    check(FLOW, 'Worker cannot access user-only dashboard (403)', r.status === 403, `HTTP ${r.status}`);

    // User tries to access admin routes
    r = await api('GET', '/admin/users', null, userToken);
    check(FLOW, 'User cannot access admin routes (403)', r.status === 403, `HTTP ${r.status}`);

    // Worker tries to access admin routes
    r = await api('GET', '/admin/users', null, workerToken);
    check(FLOW, 'Worker cannot access admin routes (403)', r.status === 403, `HTTP ${r.status}`);

    // Expired/invalid token test
    r = await api('GET', '/user/dashboard', null, 'invalid.jwt.token');
    check(FLOW, 'Invalid JWT rejected (401)', r.status === 401, `HTTP ${r.status}`);

    // User tries to delete another user (admin only)
    r = await api('DELETE', '/admin/users/000000000000000000000001', null, userToken);
    check(FLOW, 'User cannot call admin delete endpoint (403)', r.status === 403, `HTTP ${r.status}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Table Printer
// ─────────────────────────────────────────────────────────────────────────────
function printTable() {
    const passed = results.filter(r => r.result.includes('PASS')).length;
    const failed = results.filter(r => r.result.includes('FAIL')).length;

    const flows = [...new Set(results.map(r => r.flow))];

    const LINE = '='.repeat(100);
    console.log('\n\n' + LINE);
    console.log('              LOCALSERVE — INTEGRATION TEST RESULTS');
    console.log(LINE);
    console.log(`  Total: ${results.length}   ✅ Passed: ${passed}   ❌ Failed: ${failed}   Pass Rate: ${Math.round(passed/results.length*100)}%`);
    console.log(LINE);

    flows.forEach(flow => {
        console.log(`\n  📦 ${flow}`);
        console.log('  ' + '-'.repeat(97));
        const flowResults = results.filter(r => r.flow === flow);
        const col1 = Math.max(...flowResults.map(r => r.step.length)) + 2;
        flowResults.forEach(({ step, result, detail }) => {
            const stepStr = step.padEnd(col1);
            const detailStr = detail ? `(${detail})` : '';
            console.log(`  ${result}  ${stepStr} ${detailStr}`);
        });
    });

    console.log('\n' + LINE + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n🔗 Starting LocalServe Integration Tests...\n');

    // --- Get admin token first ---
    const adminLogin = await api('POST', '/auth/login', { identifier: 'admin@example.com', password: 'admin123' });
    const adminToken = adminLogin.data.token;
    if (!adminToken) { console.error('❌ Could not get admin token. Is the server running?'); process.exit(1); }

    try {
        // Run all flows
        const { userToken, userId } = await flow_UserRegistrationAndDashboard();
        const { workerToken, workerId } = await flow_WorkerRegistration();
        await flow_BookWorkerFlow(userToken, workerToken, workerId);
        await flow_JobPostAndApply(userToken, workerToken, workerId);
        await flow_QuickRequestToAdmin(adminToken);
        await flow_ContactToAdmin(adminToken);
        await flow_AdminCascadeDelete(adminToken);
        await flow_SecurityAccessControl(userToken, workerToken);

        // Clean up test worker after all flows
        if (workerId) await api('DELETE', `/admin/users/${workerId}`, null, adminToken);
        if (userId) await api('DELETE', `/admin/users/${userId}`, null, adminToken);

    } catch (err) {
        console.error('Integration test runner crashed:', err);
    }

    printTable();
}

main();
