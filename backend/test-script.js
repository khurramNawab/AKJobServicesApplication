
import fetch from 'node-fetch';

const a = async () => {
    try {
        const registerRes = await fetch('http://localhost:5000/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Candidate',
                email: 'test.candidate@example.com',
                password: 'password123',
                role: 'CANDIDATE'
            })
        });

        const registerData = await registerRes.json();
        console.log('Register:', registerData);

        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test.candidate@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        console.log('Login:', loginData);
    } catch (e) {
        console.error(e)
    }
}

a();
