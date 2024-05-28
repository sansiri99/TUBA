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

  const filteredItems = stockItems.filter(item => item.kitchen === 'บาร์รายวัน');
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
        const houseSY = parseFloat(document.getElementsByName(`houseSY_${index}`)[0].value) || 0;
        const barL = parseFloat(document.getElementsByName(`barL_${index}`)[0].value) || 0;
        const barM = parseFloat(document.getElementsByName(`barM_${index}`)[0].value) || 0;
        const z = parseFloat(document.getElementsByName(`z_${index}`)[0].value) || 0;
        const office = parseFloat(document.getElementsByName(`office_${index}`)[0].value) || 0;
        const customerBorrow = parseFloat(document.getElementsByName(`customerBorrow_${index}`)[0].value) || 0;
        
        const total = barC + storeC + houseSY + barL + barM + z + office + customerBorrow;
        document.getElementsByName(`total_${index}`)[0].value = total;
        document.getElementsByName(`total_${index}`)[0].style.fontWeight = 'bold';
      }
    });
  }
});

function createTableRow(item, index) {
  const isCategoryHeader = item.code === item.name; // Check if the row is a category header

  if (isCategoryHeader) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="12" style="font-weight: bold;">${item.name}</td>
    `;
    return row;
  } else {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td><input type="number" name="received_${index}" value="" min="0"></td>
      <td><input type="number" name="total_${index}" value="" readonly style="font-weight: bold;"></td>
      <td><input type="number" name="barC_${index}" value="" min="0"></td>
      <td><input type="number" name="storeC_${index}" value="" min="0"></td>
      <td><input type="number" name="houseSY_${index}" value="" min="0"></td>
      <td><input type="number" name="barL_${index}" value="" min="0"></td>
      <td><input type="number" name="barM_${index}" value="" min="0"></td>
      <td><input type="number" name="z_${index}" value="" min="0"></td>
      <td><input type="number" name="office_${index}" value="" min="0"></td>
      <td><input type="number" name="customerBorrow_${index}" value="" min="0"></td>
    `;
    return row;
  }
}

function generateConfirmationMessage(items) {
  let message = 'Please confirm the following details:\n\n';
  items.forEach(item => {
    message += `Code: ${item.code}\n`;
    message += `Name: ${item.name}\n`;
    message += `Received: ${item.received}\n`;
    message += `Total: ${item.total}\n`;
    message += `Bar C: ${item.barC}\n`;
    message += `Store C: ${item.storeC}\n`;
    message += `House SY: ${item.houseSY}\n`;
    message += `Bar L: ${item.barL}\n`;
    message += `Bar M: ${item.barM}\n`;
    message += `Z: ${item.z}\n`;
    message += `Office: ${item.office}\n`;
    message += `Customer Borrow: ${item.customerBorrow}\n\n`;
  });
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
      storeC: formData.get(`storeC_${index}`) || '',
      houseSY: formData.get(`houseSY_${index}`) || '',
      barL: formData.get(`barL_${index}`) || '',
      barM: formData.get(`barM_${index}`) || '',
      z: formData.get(`z_${index}`) || '',
      office: formData.get(`office_${index}`) || '',
      customerBorrow: formData.get(`customerBorrow_${index}`) || ''
    };
  });

  console.log("Filled Items:", filledItems); // Debugging line

  const header = `${getCurrentDateTime()}\n`;
  const columnHeaders = 'Code,เบียร์,รับคืน,Total,บาร์ C,สโตร์ C,บ้านSY,บาร์ L,บาร์ M,Z,Office,ลูกค้ายืม\n';
  const csvContent = header + columnHeaders + items.map((item, index) => [
    `"${item.code}"`,
    `"${item.name}"`,
    `"${formData.get(`received_${index}`) || ''}"`,
    `"${formData.get(`total_${index}`) || ''}"`,
    `"${formData.get(`barC_${index}`) || ''}"`,
    `"${formData.get(`storeC_${index}`) || ''}"`,
    `"${formData.get(`houseSY_${index}`) || ''}"`,
    `"${formData.get(`barL_${index}`) || ''}"`,
    `"${formData.get(`barM_${index}`) || ''}"`,
    `"${formData.get(`z_${index}`) || ''}"`,
    `"${formData.get(`office_${index}`) || ''}"`,
    `"${formData.get(`customerBorrow_${index}`) || ''}"`
  ].join(',')).join('\n');

  console.log("CSV Content:", csvContent); // Debugging line

  const bom = '\uFEFF';
  const finalCsvContent = bom + csvContent;

  const blob = new Blob([finalCsvContent], { type: 'text/csv;charset=utf-8;' });
  const reader = new FileReader();

  reader.onload = async function(event) {
    const base64data = btoa(event.target.result);
    const fileName = `${getFormattedDateTime()}_นับสต๊อก_บาร์_รายวัน.csv`;

    const uploadForm = new FormData();
    uploadForm.append('file', base64data);
    uploadForm.append('mimeType', 'text/csv');
    uploadForm.append('filename', fileName);

    try {
      const response = await fetch(getUploadURL('บาร์รายวัน'), { 
        method: 'POST',
        body: uploadForm
      });
      const result = await response.json();
      hideLoadingSpinner();
      if (result.url) {
        window.location.href = `complete.html?fileUrl=${encodeURIComponent(result.url)}&formType=barday`;
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
