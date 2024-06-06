import { stockItems } from './stockItems.js';  // Import stockItems
import { 
  getCurrentDateTime, 
  getFormattedDateTime, 
  populateTable, 
  handleFormSubmission,  
  populateConfirmationTable5, 
  hideModal, 
  handleFinalSubmit,
  getUploadURL,
  sendLineNotify, 
  filterFilledItemsWithTotal1
} from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const timestampField = document.getElementById('timestamp');
  timestampField.value = getCurrentDateTime();

  const kitchenType = 'บาร์รายวันบุหรี่';

  const filteredItems = stockItems.filter(item => item.kitchen === 'บาร์รายวันบุหรี่');
  populateTable(filteredItems, 'stockTableBody', createTableRowForbardaycigarettes);

  // Attach event listeners for input fields to calculate total
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', calculateTotal);
  });

  handleFormSubmission('stockForm', filteredItems, filterFilledItemsWithTotal1, function(filledItems) {
    populateConfirmationTable5(filledItems, 'confirmationTableBody');
  });

  handleFinalSubmit('finalSubmitButton', 'stockForm', filteredItems, async function(items, formId) {
    showLoadingSpinner();

    const formData = new FormData(document.getElementById(formId));
    const employeeName = document.getElementById('employeeName').value;

    if (!employeeName) {
        alert('Employee Name is required!');
        hideLoadingSpinner();
        return;
    }

    const filledItems = items.map((item, index) => {
      return {
        code: item.code,
        name: item.name,
        received: formData.get(`received_${index}`) || "",
        total: formData.get(`total_${index}`) || "",
        barC: formData.get(`barC_${index}`) || "",
        storeC: formData.get(`storeC_${index}`) || ""

      };
    });

    const header = `${kitchenType}, ${getCurrentDateTime()},ผู้กรอกข้อมูล: ${employeeName}\n`;
    const columnHeaders = 'รหัส,รายการ,รับคืน,Total,บาร์ C,สโตร์ C\n';
    const csvContent = header + columnHeaders + filledItems.map(item => [
      `"${item.code}"`,
      `"${item.name}"`,
      `"${item.received}"`,
      `"${item.total}"`,
      `"${item.barC}"`,
      `"${item.storeC}"`
    ].join(',')).join('\n');

    const bom = '\uFEFF';
    const finalCsvContent = bom + csvContent;

    const blob = new Blob([finalCsvContent], { type: 'text/csv;charset=utf-8;' });
    const reader = new FileReader();

    reader.onload = async function(event) {
      const base64data = btoa(event.target.result);
      const fileName = `${getFormattedDateTime()}_นับสต๊อก_บาร์_รายวัน_บุหรี่.csv`;

      const uploadForm = new FormData();
      uploadForm.append('file', base64data);
      uploadForm.append('mimeType', 'text/csv');
      uploadForm.append('filename', fileName);
      
      try {
        const response = await fetch(getUploadURL(kitchenType), { 
          method: 'POST',
          body: uploadForm
        });
        const result = await response.json();
        hideLoadingSpinner();
        if (result.url) {
          sendLineNotify('bardaycigarettes', result.url, employeeName);  // Pass the employee name to LINE Notify function
          window.location.href = `complete.html?fileUrl=${encodeURIComponent(result.url)}&formType=bardaycigarettes&employeeName=${encodeURIComponent(employeeName)}`;
        } else {
          document.getElementById('result').innerHTML = `<p>Error uploading file: ${result.error}</p>`;
        }
      } catch (error) {
        hideLoadingSpinner();
        document.getElementById('result').innerHTML = `<p>Error uploading file: ${error}</p>`;
      }
    };
  
    reader.readAsBinaryString(blob);
    hideModal('modalBackdrop', 'confirmationModal');
  });

  function createTableRowForbardaycigarettes(item, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td><input type="number" name="received_${index}" value="" min="0"></td>
      <td><input type="number" name="total_${index}" value="" readonly style="font-weight: bold; background-color: #f2f2f2;"></td>
      <td><input type="number" name="barC_${index}" value="" min="0"></td>
      <td><input type="number" name="storeC_${index}" value="" min="0"></td>

    `;
    return row;
  }

  function calculateTotal(event) {
    const index = event.target.name.split('_')[1];
    const barC = parseFloat(document.getElementsByName(`barC_${index}`)[0].value) || 0;
    const storeC = parseFloat(document.getElementsByName(`storeC_${index}`)[0].value) || 0;
    const total = barC + storeC;
    document.getElementsByName(`total_${index}`)[0].value = total;
    document.getElementsByName(`total_${index}`)[0].style.fontWeight = 'bold';
    document.getElementsByName(`total_${index}`)[0].style.backgroundColor = '#f2f2f2';
  }



  function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
  }

  function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
  }

  document.getElementById('backButton').addEventListener('click', function() {
    hideModal('modalBackdrop', 'confirmationModal');
  });

  document.getElementById('resetButton').addEventListener('click', function() {
    if (confirm('คุณแน่ใจหรือว่าต้องการรีเซ็ตแบบฟอร์ม?')) {
      document.getElementById('stockForm').reset();
      timestampField.value = getCurrentDateTime();
    }
  });

  document.getElementById('homeButton').addEventListener('click', function() {
    if (confirm('คุณแน่ใจหรือว่าต้องการกลับไปหน้าแรก?')) {
      window.location.href = 'index.html';
    }
  });
});
