const token = localStorage.getItem('token');
const mobile = localStorage.getItem('mobile');
const codeId = localStorage.getItem('codeId');
const role = localStorage.getItem('role');

// Protect route
if (!token || !mobile || !codeId || role !== "CUSTOMER") {
  alert("Unauthorized. Please login as a customer.");
  window.location.href = "login.html";
}
// Logout function
function logout() {
  localStorage.removeItem('token');
  alert("Logged out successfully.");
  window.location.href = "login.html"; // change to your login page path
}

async function getDailySlip() {
  const date = document.getElementById('entryDate').value;
  const session = document.getElementById('sessionSelect').value;

  if (!date) {
    alert("Please select a date.");
    return;
  }

  if (!session) {
    alert("Please select a session.");
    return;
  }

  const res = await fetch(`http://localhost:8080/milk/by-codeid-date?codeId=${codeId}&date=${date}&session=${session}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const resultDiv = document.getElementById('slipResult');
  resultDiv.innerHTML = "";

  if (res.ok) {
    const data = await res.json();

    if (!data || Object.keys(data).length === 0) {
      resultDiv.innerHTML = "<p>No milk entry found for the selected date and session.</p>";
    } else {
      resultDiv.innerHTML = `
        <h4>Milk Slip (${date} - ${session.charAt(0) + session.slice(1).toLowerCase()})</h4>
        <p><b>Customer Name:</b> ${data.customerName}</p>
        <p><b>Milk Type:</b> ${data.milkType}</p>
        <p><b>Total Milk:</b> ${data.totalMilk} L</p>
        <p><b>Fat:</b> ${data.fat} %</p>
        <p><b>SNF:</b> ${data.snf} %</p>
        <p><b>Rate per Liter:</b> ₹${data.ratePerLitre}</p>
        <p><b>Total Amount:</b> ₹${data.totalAmount}</p>
      `;
    }

  } else {
    resultDiv.innerHTML = "<p>Error fetching slip. Try again.</p>";
  }
}

// Fetch and preview 10-day bill detailed entries by selected start date
async function getBill() {
  const billResult = document.getElementById('billResult');
  billResult.innerHTML = '';
  const startDate = document.getElementById('billDate').value;
  if (!startDate) {
    alert("Please select a start date.");
    return;
  }
  try {
    const res = await fetch(`http://localhost:8080/customer/bills/details/${codeId}/${startDate}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      const entries = await res.json();
      if (entries.length === 0) {
        billResult.innerHTML = '<p>No milk entries found for the selected period.</p>';
        return;
      }
      let tableHtml = `
        <h4>10-Day Milk Entries Starting ${startDate}</h4>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Date</th>
              <th>Session</th>
              <th>Milk Type</th>
              <th>Total Milk (L)</th>
              <th>Fat (%)</th>
              <th>SNF (%)</th>
              <th>Rate per Liter (₹)</th>
              <th>Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
      `;
      entries.forEach(entry => {
        tableHtml += `
          <tr>
            <td>${entry.entryDate}</td>
            <td>${entry.session}</td>
            <td>${entry.milkType}</td>
            <td>${entry.totalMilk}</td>
            <td>${entry.fat}</td>
            <td>${entry.snf}</td>
            <td>${entry.ratePerLitre}</td>
            <td>${entry.totalAmount}</td>
          </tr>
        `;
      });
      tableHtml += '</tbody></table>';
      billResult.innerHTML = tableHtml;
    } else {
      billResult.innerHTML = '<p>Error fetching bill details.</p>';
    }
  } catch (error) {
    billResult.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

// Download latest 10-day bill PDF
async function downloadMyBill() {
  try {
    const res = await fetch(`http://localhost:8080/customer/bills/history/${codeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      const files = await res.json();
      if (files.length === 0) {
        alert('No bills found to download.');
        return;
      }
      const latestFile = files[files.length - 1];
      const downloadUrl = `http://localhost:8080/customer/bills/download/${latestFile}`;
      window.open(downloadUrl, '_blank');
    } else {
      alert('Failed to fetch bill history.');
    }
  } catch (error) {
    alert('Error fetching bill history: ' + error.message);
  }
}

// Fetch and display bill history
async function getBillHistory() {
  const historyResult = document.getElementById('historyResult');
  historyResult.innerHTML = '';
  try {
    const res = await fetch(`http://localhost:8080/customer/bills/history/${codeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      const files = await res.json();
      if (files.length === 0) {
        historyResult.innerHTML = '<p>No bill history found.</p>';
        return;
      }
      let listHtml = '<ul>';
      files.forEach(file => {
        const url = `http://localhost:8080/customer/bills/download/${file}`;
        listHtml += `<li><a href="${url}" target="_blank">${file}</a></li>`;
      });
      listHtml += '</ul>';
      historyResult.innerHTML = listHtml;
    } else {
      historyResult.innerHTML = '<p>Failed to fetch bill history.</p>';
    }
  } catch (error) {
    historyResult.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

document.getElementById('downloadMyBill').addEventListener('click', downloadMyBill);
