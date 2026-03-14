async function testAuth() {
    const email = `test.user.${Date.now()}@example.com`;
    const password = 'mySecretPassword123!';

    console.log('Registering user:', email);

    // Register
    const regRes = await fetch('http://127.0.0.1:5002/api/auth/register', {
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

testAuth().catch(console.error);
