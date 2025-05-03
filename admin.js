const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== "ADMIN") {
  alert("Unauthorized. Please login as an admin.");
  window.location.href = "login.html";
}

async function generateAllBills() {
  const billStatus = document.getElementById('billStatus');
  billStatus.style.display = 'none';
  billStatus.textContent = '';

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate) {
    alert("Please select a start date.");
    return;
  }
  if (!endDate) {
    alert("Please select an end date.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/admin/generate-bills?startDate=${startDate}&endDate=${endDate}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      const text = await res.text();
      billStatus.textContent = text;
      billStatus.className = 'result-message';
      billStatus.style.display = 'block';
    } else {
      const errorText = await res.text();
      billStatus.textContent = `Error: ${errorText}`;
      billStatus.className = 'result-message error';
      billStatus.style.display = 'block';
    }
  } catch (error) {
    billStatus.textContent = `Error: ${error.message}`;
    billStatus.className = 'result-message error';
    billStatus.style.display = 'block';
  }
}

async function generateBill() {
  const codeIdInput = document.getElementById('codeIdInput');
  const singleBillStatus = document.getElementById('singleBillStatus');
  singleBillStatus.style.display = 'none';
  singleBillStatus.textContent = '';

  const codeId = codeIdInput.value.trim();
  if (!codeId) {
    alert("Please enter a customer Code ID.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/admin/generate-bill/${codeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      singleBillStatus.textContent = "Bill generated successfully.";
      singleBillStatus.className = 'result-message';
      singleBillStatus.style.display = 'block';
    } else {
      const errorText = await res.text();
      singleBillStatus.textContent = `Error: ${errorText}`;
      singleBillStatus.className = 'result-message error';
      singleBillStatus.style.display = 'block';
    }
  } catch (error) {
    singleBillStatus.textContent = `Error: ${error.message}`;
    singleBillStatus.className = 'result-message error';
    singleBillStatus.style.display = 'block';
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// New code to handle user registration form submission
const registerForm = document.getElementById('registerForm');
const registerResult = document.getElementById('registerResult');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const role = document.getElementById('role').value;
  const codeId = document.getElementById('codeId').value.trim();
  const milkType = document.getElementById('milkType').value;

  if (!name || !mobile || !role || !codeId || !milkType) {
    registerResult.textContent = "Please fill in all fields.";
    registerResult.className = 'result-message error';
    registerResult.style.display = 'block';
    return;
  }

  const userData = {
    name,
    mobile,
    role,
    codeId,
    milkType
  };

  try {
    const response = await fetch('http://localhost:8080/auth/admin/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const text = await response.text();
      registerResult.textContent = text;
      registerResult.className = 'result-message';
      registerResult.style.display = 'block';
      registerForm.reset();
    } else {
      const errorText = await response.text();
      registerResult.textContent = `Error: ${errorText}`;
      registerResult.className = 'result-message error';
      registerResult.style.display = 'block';
    }
  } catch (error) {
    registerResult.textContent = `Error: ${error.message}`;
    registerResult.className = 'result-message error';
    registerResult.style.display = 'block';
  }
});
