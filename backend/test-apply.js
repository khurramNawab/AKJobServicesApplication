const run = async () => {
    try {
        let res = await fetch('http://localhost:5000/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Cand1', email: 'cand2@test.com', password: 'password123', role: 'CANDIDATE' })
        });
        let json = await res.json();

        let token = json.token;
        if (!token) {
            // log in
            res = await fetch('http://localhost:5000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'cand2@test.com', password: 'password123' })
            });
            json = await res.json();
            token = json.token;
        }

        console.log("Token received.");

        // get jobs
        res = await fetch('http://localhost:5000/api/v1/jobs');
        const jobsJson = await res.json();
        const firstJob = jobsJson.data ? jobsJson.data[0] : null;
        console.log("Job ID:", firstJob ? firstJob._id : null);

        if (firstJob) {
            res = await fetch(`http://localhost:5000/api/v1/jobs/${firstJob._id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const applyJson = await res.json();
            console.log("Apply response:", applyJson);
        }

    } catch (e) { console.error(e) }
}
run();
