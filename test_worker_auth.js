async function testWorkerAuth() {
    const email = `worker.${Date.now()}@example.com`;
    const password = 'workerPassword123!';

    console.log('Registering worker:', email);

    // Register Worker
    const regRes = await fetch('http://127.0.0.1:5002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Worker',
            email,
            phone: email,
            password,
            role: 'worker',
            location: 'Test City',
            skills: 'Testing',
            availability: 'Always',
            serviceType: 'plumber',
        })
    });

    const regData = await regRes.text();
    console.log('Registration Response:', regRes.status, regData);

    // Login
    console.log('Attempting login...');
    const loginRes = await fetch('http://127.0.0.1:5002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password
        })
    });

    const loginData = await loginRes.text();
    console.log('Login Response:', loginRes.status, loginData);
}

testWorkerAuth().catch(console.error);
