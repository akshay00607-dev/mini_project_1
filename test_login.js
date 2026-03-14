async function run() {
    try {
        const res = await fetch('http://localhost:5002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: "testuser123_unique",
                password: "password123"
            })
        });
        const data = await res.json();
        console.log("STATUS:", res.status);
        console.log("BODY:", data);
    } catch (e) { console.error(e) }
}
run();
