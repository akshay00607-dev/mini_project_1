import fetch from 'node-fetch'; // if needed, but node 18+ has fetch

async function testAuth() {
    const email = `testuser${Date.now()}@example.com`;
    const password = 'mySecretPassword123!';

    console.log('Registering user:', email);

    // Register
    const regRes = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Setup User',
            email,
            password,
            phone: '1234567890',
            role: 'user'
        })
    });

    const regData = await regRes.json();
    console.log('Registration Response:', regRes.status, regData);

    // Login
    console.log('Attempting login...');
    const loginRes = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password
        })
    });

    const loginData = await loginRes.json();
    console.log('Login Response:', loginRes.status, loginData);
}

testAuth().catch(console.error);
