async function run() {
    try {
        const res = await fetch('http://localhost:5002/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: "testuser123_unique",
                name: "Test User",
                email: "testuser123@example.com",
                phone: "123456",
                password: "password123",
                role: "user",
                location: "Kerala"
            })
        });
        const data = await res.json();
        console.log("STATUS:", res.status);
        console.log("BODY:", data);
    } catch (e) { console.error(e) }
}
run();
