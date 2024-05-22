import { stockItems } from './stockItems.js';

document.addEventListener('DOMContentLoaded', function() {
  const stockTableBody = document.getElementById('stockTableBody');
  const timestampField = document.getElementById('timestamp');
  const pageTitle = document.title;
  const headerTitle = document.querySelector('.kitchen-header');
  const navigateButton = document.getElementById('navigateButton');
  const loadingMessage = document.getElementById('loadingMessage');
  const confirmationModal = document.getElementById('confirmationModal');
  const confirmationTableBody = document.getElementById('confirmationTableBody');
  const finalSubmitButton = document.getElementById('finalSubmitButton');
  const backButton = document.getElementById('backButton');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const loadingSpinner = document.getElementById('loadingSpinner');

  // Set current date and time
  const now = new Date();
  timestampField.value = now.toLocaleString();

  // Function to format date and time for the file name
  function getFormattedDateTime() {
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  }

  // Determine kitchen type
  const isThaiKitchen = pageTitle.includes('ครัวไทย');
  const kitchenType = isThaiKitchen ? 'ครัวไทย' : 'ครัวอิตาเลี่ยน';

  // Filter stock items for the selected kitchen
  const filteredItems = stockItems.filter(item => item.kitchen === (isThaiKitchen ? 'ไทย' : 'อิตาเลี่ยน'));

  // Populate the table with stock items
  filteredItems.forEach((item, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.fixedStock}</td>
      <td><input type="number" name="inventoryCount_${index}" placeholder=""></td>
      <td><input type="number" name="numberToOrder_${index}" placeholder=""></td>
      <td><input type="number" name="counting_${index}" placeholder=""></td>
      <td>${item.type}</td>
      <td>${item.kitchen}</td>
    `;

    stockTableBody.appendChild(row);
  });

  // Form submission handler
  document.getElementById('stockForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const filledItems = [];

    formData.forEach((value, key) => {
      const [name, index] = key.split('_');
      if (!filledItems[index]) filledItems[index] = { [name]: value || "" };
      else filledItems[index][name] = value || "";
    });

    // Filter out empty rows
    const filteredFilledItems = filledItems.filter(item => {
      return item.inventoryCount || item.numberToOrder || item.counting;
    });

    // Populate the confirmation table with filled items
    confirmationTableBody.innerHTML = '';
    filteredFilledItems.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${filteredItems[index].name}</td>
        <td>${filteredItems[index].fixedStock}</td>
        <td>${item.inventoryCount}</td>
        <td>${item.numberToOrder}</td>
        <td>${item.counting}</td>
        
      `;
      confirmationTableBody.appendChild(row);
    });

    // Show the confirmation modal
    modalBackdrop.style.display = 'block';
    confirmationModal.style.display = 'block';
  });

  // Final submit button handler
  finalSubmitButton.addEventListener('click', function() {
    loadingSpinner.style.display = 'block'; // Show the loading spinner

    const formData = new FormData(document.getElementById('stockForm'));
    const data = { items: [] };

    formData.forEach((value, key) => {
      const [name, index] = key.split('_');
      if (!data.items[index]) data.items[index] = { [name]: value || "" };
      else data.items[index][name] = value || "";
    });

    data.items.forEach((item, index) => {
      item.name = filteredItems[index].name;
      item.fixedStock = filteredItems[index].fixedStock;
      item.inventoryCount = item.inventoryCount || "";
      item.numberToOrder = item.numberToOrder || "";
      item.counting = item.counting || "";
      item.type = filteredItems[index].type;
      item.kitchen = filteredItems[index].kitchen;
    });

    // Generate CSV content with header and timestamp
    const header = `${kitchenType}, ${now.toLocaleString()}\n`;
    const columnHeaders = 'ชื่อ,สต็อกที่กำหนด,นับสินค้าคงคลัง,จำนวนที่ต้องการสั่งซื้อ,จำนวนนับ,ประเภท,ครัว\n';
    const csvContent = header + columnHeaders + data.items.map(item => [
      `"${item.name}"`,
      `"${item.fixedStock}"`,
      `"${item.inventoryCount}"`,
      `"${item.numberToOrder}"`,
      `"${item.counting}"`,
      `"${item.type}"`,
      `"${item.kitchen}"`
    ].join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const reader = new FileReader();

    reader.onload = function(event) {
      const base64data = btoa(event.target.result);
      const fileName = `${getFormattedDateTime()}_นับสต๊อกครัวไทย.csv`;

      // Create a form to submit the data
      const uploadForm = new FormData();
      uploadForm.append('file', base64data);
      uploadForm.append('mimeType', 'text/csv');
      uploadForm.append('filename', fileName);

      fetch('https://script.google.com/macros/s/AKfycbx_SZ29mQEXXRPfgAk_xTapQ5LRlOL3O9ZNrTb9A0q_XsuecLkC3M2ivelwncqg-DO-/exec', {
        method: 'POST',
        body: uploadForm
      })
      .then(response => response.json())
      .then(result => {
        if (result.url) {
          // Redirect to the completion page with the file URL and form type as query parameters
          window.location.href = `complete.html?fileUrl=${encodeURIComponent(result.url)}&formType=thai`;
        } else {
          loadingMessage.style.display = 'none';
          document.getElementById('result').innerHTML = `<p>Error uploading file: ${result.error}</p>`;
          loadingSpinner.style.display = 'none'; // Hide the loading spinner
        }
      })
      .catch(error => {
        loadingMessage.style.display = 'none';
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<p>Error uploading file: ${error}</p>`;
        loadingSpinner.style.display = 'none'; // Hide the loading spinner
      });
    };

    reader.readAsBinaryString(blob);

    // Hide the confirmation modal
    modalBackdrop.style.display = 'none';
    confirmationModal.style.display = 'none';
  });

  // Back button handler
  backButton.addEventListener('click', function() {
    // Hide the confirmation modal
    modalBackdrop.style.display = 'none';
    confirmationModal.style.display = 'none';
  });

  // Reset button handler
  document.getElementById('resetButton').addEventListener('click', function() {
    if (confirm('คุณแน่ใจหรือว่าต้องการรีเซ็ตแบบฟอร์ม?')) {
      document.getElementById('stockForm').reset();
      timestampField.value = new Date().toLocaleString(); // Reset timestamp
    }
  });

  // Navigate button handler
  navigateButton.addEventListener('click', function() {
    if (confirm(`คุณแน่ใจหรือว่าต้องการไปยังหน้าการจัดการสต็อก - ครัว${isThaiKitchen ? 'อิตาเลี่ยน' : 'ไทย'}?`)) {
      location.href = isThaiKitchen ? 'italian.html' : 'thai.html';
    }
  });
});
