import { stockItems } from './stockItems.js';
import { 
  getCurrentDateTime, 
  getFormattedDateTime, 
  populateTable, 
  handleFormSubmission, 
  getUploadURL 
} from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const timestampField = document.getElementById('timestamp');
  if (timestampField) {
    timestampField.value = getCurrentDateTime();
  }

  const filteredItems = stockItems.filter(item => item.kitchen === 'บาร์รายวันบุหรี่');
  populateTable(filteredItems, 'stockTableBody', createTableRow);

  handleFormSubmission('stockForm', filteredItems, function(filledItems) {
    if (confirm(generateConfirmationMessage(filteredItems))) {
      handleFinalSubmit(filteredItems, 'stockForm');
    }
  });

  document.getElementById('resetButton').addEventListener('click', function() {
    if (confirm('คุณแน่ใจหรือว่าต้องการรีเซ็ตแบบฟอร์ม?')) {
      document.getElementById('stockForm').reset();
      timestampField.value = getCurrentDateTime();
    }
  });

  document.getElementById('navigateButton').addEventListener('click', function() {
    if (confirm('คุณแน่ใจหรือว่าต้องการกลับไปหน้าแรก?')) {
      window.location.href = 'index.html';
    }
  });

  const stockTable = document.getElementById('stockTable');
  if (stockTable) {
    stockTable.addEventListener('input', function(event) {
      if (event.target.name) {
        const index = event.target.name.split('_')[1];
        const barC = parseFloat(document.getElementsByName(`barC_${index}`)[0].value) || 0;
        const storeC = parseFloat(document.getElementsByName(`storeC_${index}`)[0].value) || 0;
        
        const total = barC + storeC;
        const totalField = document.getElementsByName(`total_${index}`)[0];
        totalField.value = total;
        totalField.style.fontWeight = 'bold';
        totalField.style.backgroundColor = '#f2f2f2'; // Set background color to light gray
      }
    });
  }
});

function createTableRow(item, index) {
  const isCategoryHeader = item.code === item.name; // Check if the row is a category header

  if (isCategoryHeader) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="6" style="font-weight: bold; background-color: #f2f2f2; text-align: center;">${item.name}</td>
    `;
    return row;
  } else {
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
}

function generateConfirmationMessage(items) {
  let message = 'กรุญา "ตรวจสอบ" ข้อมูลก่อนส่ง:\n\n';
  return message;
}

async function handleFinalSubmit(items, formId) {
  showLoadingSpinner();

  const formData = new FormData(document.getElementById(formId));
  const filledItems = items.map((item, index) => {
    return {
      code: item.code,
      name: item.name,
      received: formData.get(`received_${index}`) || '',
      total: formData.get(`total_${index}`) || '',
      barC: formData.get(`barC_${index}`) || '',
      storeC: formData.get(`storeC_${index}`) || ''
    };
  });

  console.log("Filled Items:", filledItems); // Debugging line

  const header = `${getCurrentDateTime()}\n`;
  const columnHeaders = 'Code,รายการ,รับคืน,Total,บาร์ C,สโตร์ C\n';
  const csvContent = header + columnHeaders + filledItems.map(item => [
    `"${item.code}"`,
    `"${item.name}"`,
    `"${item.received}"`,
    `"${item.total}"`,
    `"${item.barC}"`,
    `"${item.storeC}"`
  ].join(',')).join('\n');

  console.log("CSV Content:", csvContent); // Debugging line

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
      const response = await fetch(getUploadURL('บาร์รายวันบุหรี่'), { 
        method: 'POST',
        body: uploadForm
      });
      const result = await response.json();
      hideLoadingSpinner();
      if (result.url) {
        window.location.href = `complete.html?fileUrl=${encodeURIComponent(result.url)}&formType=bardaycigarettes`;
      } else {
        document.getElementById('result').innerHTML = `<p>Error uploading file: ${result.error}</p>`;
      }
    } catch (error) {
      hideLoadingSpinner();
      document.getElementById('result').innerHTML = `<p>Error uploading file: ${error}</p>`;
    }
  };

  reader.readAsBinaryString(blob);
}

function showLoadingSpinner() {
  document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoadingSpinner() {
  document.getElementById('loadingSpinner').style.display = 'none';
}