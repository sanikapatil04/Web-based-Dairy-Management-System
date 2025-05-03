document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const role = document.getElementById('role').value;
    const codeId = document.getElementById("codeId").value;
    if (!name || !mobile || !role) {
        alert("All fields are required!");
        return;
    }

    try {
        const token = localStorage.getItem('token'); // Get JWT from login

        const response = await fetch('http://localhost:8080/auth/admin/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token // ✅ secure registration
            },
            body: JSON.stringify({ name, mobile, role ,codeId})
        });

        if (!response.ok) {
            throw new Error("Registration failed. User might already exist.");
        }

        alert("User registered successfully!");
        document.getElementById('registerForm').reset();
    } catch (error) {
        console.error(error);
        alert("Error during registration. Make sure you are logged in as Admin.");
    }
});
