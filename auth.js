function sendOtp() {
    let mobile = document.getElementById("mobile").value;

    fetch("http://localhost:8080/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobile })
    })
    .then(response => response.text())
    .then(data => alert(data));
}

function verifyOtp() {
    let mobile = document.getElementById("mobile").value;
    let otp = document.getElementById("otp").value;

    fetch("http://localhost:8080/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobile, otp: otp })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            
            if (data.role === "CUSTOMER") window.location.href = "customer.html";
            if (data.role === "DAIRY_MANAGER") window.location.href = "manager.html";
            if (data.role === "ADMIN") window.location.href = "admin.html";
        } else {
            alert("Invalid OTP");
        }
    });
}
