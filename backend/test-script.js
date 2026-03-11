const email = "test@example.com";
const password = "password";

fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
})
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
