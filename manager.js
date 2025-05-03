// 🔐 Function to parse JWT token
function parseJwt(token) {
  try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
          window.atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
      );
      return JSON.parse(jsonPayload);
  } catch (e) {
      console.error("Error parsing JWT:", e);
      return null;
  }
}

// 🚨 Role check on page load
(function checkManagerRole() {
  const token = localStorage.getItem("token");
  if (!token) {
      alert("Access denied. Please log in.");
      window.location.href = "login.html";
      return;
  }
   // Logout function
function logout() {
    localStorage.removeItem('token');
    alert("Logged out successfully.");
    window.location.href = "login.html"; // change to your login page path
  }

  const payload = parseJwt(token);
  if (!payload || !payload.authorities || !payload.authorities.includes("DAIRY_MANAGER")) {
      alert("Access denied. Only Dairy Managers can access this page.");
      window.location.href = "login.html";
  }
})();


// 🧑‍🌾 Autofill customer info based on Code ID
document.getElementById('codeId').addEventListener('blur', async function () {
  const codeId = this.value;
  if (!codeId) return;

  try {
      const token = localStorage.getItem('token');
      console.log('Current token:', token);

      const url = `http://localhost:8080/users/get-by-code/${codeId}`;
      console.log('Making request to:', url);

      const response = await fetch(url, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });
       
      console.log("Sending request to /milk/add with token:", token);
      console.log('Response status:', response.status);
      
      if (response.status === 403) {
          console.error('Access denied - Token or role invalid');
          alert('Access denied. Please check your permissions or login again.');
          window.location.href = "login.html";
          return;
      }

      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
          console.error('Request failed with status:', response.status);
          throw new Error(response.status === 404 ? 'User not found' : 'Request failed');
      }

      const data = JSON.parse(responseText);

      document.getElementById('customerName').value = data.name;
      document.getElementById('milkType').value = data.milkType;

  } catch (err) {
      alert('Customer not found for this Code ID');
      console.error(err);
  }
});


// 🧮 Auto-calculate total amount
['totalMilk', 'rate'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
      const milk = parseFloat(document.getElementById('totalMilk').value) || 0;
      const rate = parseFloat(document.getElementById('rate').value) || 0;
      document.getElementById('totalAmount').value = (milk * rate).toFixed(2);
  });
});


// 📩 Submit milk entry form
document.getElementById('milkEntryForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  console.log("Submitting milk entry with token:", token);
  const decoded = parseJwt(token);
  console.log("Decoded token payload:", decoded);
  if (decoded && decoded.exp) {
      const expiryDate = new Date(decoded.exp * 1000);
      console.log("Token expiry date:", expiryDate);
      if (expiryDate < new Date()) {
          alert("Session expired. Please login again.");
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('mobile');
          localStorage.removeItem('codeId');
          window.location.href = "login.html";
          return;
      }
  }

  // Prepare payload with correct types and no extra fields
  const milkTypeRaw = document.getElementById('milkType').value;
  const milkType = milkTypeRaw.toUpperCase() === 'BUFFALO' ? 'BUFFALO' : 'COW'; // default to COW if unknown

  const payload = {
      codeId: document.getElementById('codeId').value,
      customerName: document.getElementById('customerName').value,
      milkType: milkType,
      date: document.getElementById('date').value,
      session: document.getElementById('session').value,
      totalMilk: parseFloat(document.getElementById('totalMilk').value),
      fat: parseFloat(document.getElementById('fat').value),
      snf: parseFloat(document.getElementById('snf').value),
      ratePerLitre: parseFloat(document.getElementById('rate').value)
      // totalAmount removed as backend calculates it
  };

  try {
    const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/milk/add', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);
        throw new Error("Entry failed");
    }
    

      alert("Milk entry saved!");
      this.reset();
      document.getElementById('customerName').value = '';
      document.getElementById('milkType').value = '';
      document.getElementById('totalAmount').value = '';

      // 🧾 Generate and download PDF slip
      await generatePdfSlip(payload);

  } catch (err) {
      if (err.message === "Entry failed") {
          alert("Entry failed: You might not have permission or your session may have expired. Please login again.");
          localStorage.removeItem('token');
          
      } else {
          alert("Milk entry saved!");
      }
      console.error(err);
  }
});


// 📄 PDF generation
async function generatePdfSlip(payload) {
  try {
      const response = await fetch('http://localhost:8080/api/generate-pdf', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `milk_entry_${payload.codeId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
  } catch (err) {
      alert("Error generating PDF slip");
      console.error(err);
  }
}

