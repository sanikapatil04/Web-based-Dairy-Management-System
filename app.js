const sendOtpForm = document.getElementById("sendOtpForm");
const verifyOtpForm = document.getElementById("verifyOtpForm");
const otpBlock = document.getElementById("verifyOtpForm");

sendOtpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const mobile = document.getElementById("mobile").value;

  try {
    const res = await fetch("http://localhost:8080/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mobile })
    });

    if (res.ok) {
      alert("✅ OTP sent to your mobile.");
      sendOtpForm.style.display = "none"; // hide mobile form
      document.getElementById("otpBlock").style.display = "block"; // show OTP form
    } else {
      const msg = await res.text();
      alert("❌ Failed to send OTP: " + msg);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Failed to send OTP. Server error.");
  }
});

verifyOtpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mobile = document.getElementById("mobile").value;
  const otp = document.getElementById("otp").value;

  try {
    const res = await fetch("http://localhost:8080/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mobile, otp })
    });

    const data = await res.json();
    console.log("✅ Parsed data:", data);

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("mobile", data.mobile);
      localStorage.setItem("codeId", data.codeId);

      alert("✅ Login successful!");
      console.log("🔀 Redirecting to:", data.role);
      console.log("➡ Full Response Data:", data);

      if (data.role === "ADMIN") {
        window.location.href = "admin.html";
      } else if (data.role === "DAIRY_MANAGER") {
        window.location.href = "manager.html";
      } else if (data.role === "CUSTOMER") {
        window.location.href = "customer.html";
      } else {
        alert("❌ Unknown role: " + data.role);
      }
    } else {
      alert("❌ Invalid OTP");
    }
  } catch (err) {
    console.error("❌ Error during OTP verification:", err);
    alert("❌ Server error during OTP verification.");
  }
});
