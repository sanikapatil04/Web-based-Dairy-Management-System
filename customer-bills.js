document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    const codeId = localStorage.getItem('codeId');
  
    if (!token || !codeId) {
      alert("Unauthorized access. Please log in.");
      window.location.href = "login.html";
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/bills/${codeId}`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
  
      if (!response.ok) throw new Error("Failed to load bills");
  
      const bills = await response.json();
      const tableBody = document.getElementById("billTableBody");
  
      bills.forEach(bill => {
        const row = `
          <tr>
            <td>${bill.generatedDate}</td>
            <td>${bill.fileName}</td>
            <td><a class="download-link" href="http://localhost:8080/api/bills/download/${bill.fileName}" target="_blank">Download</a></td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
  
    } catch (error) {
      console.error(error);
      alert("Unable to fetch bill history");
    }
  });
  