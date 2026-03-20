
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YjE0YWZjYzE2OGFjMzU3MzAyNDNhZiIsImlhdCI6MTc3MzIyNjc0OCwiZXhwIjoxNzc1ODE4NzQ4fQ.km3LJ3sSJe87z9Ndj6m6hidA4mbN5Lk7b0eXBmQPtWg';

const a = async () => {
    try {
        const form = new FormData();
        form.append('photo', fs.createReadStream('./test-image.txt'));

        const res = await fetch('http://localhost:5000/api/v1/candidates/me/photo', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                ...form.getHeaders()
            },
            body: form
        });

        const data = await res.json();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}

a();
