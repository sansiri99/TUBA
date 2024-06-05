import { stockItems } from './stockItems.js';  // Import stockItems
import { 
  getCurrentDateTime, 
  getFormattedDateTime, 
  populateTable, 
  handleFormSubmission, 
  filterFilledItems, 
  populateConfirmationTable4, 
  showModal, 
  hideModal, 
  handleFinalSubmit,
  getUploadURL,
  sendLineNotify 
} from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const timestampField = document.getElementById('timestamp');
  timestampField.value = getCurrentDateTime();

  const kitchenType = 'บาร์รายวัน';

  const filteredItems = stockItems.filter(item => item.kitchen === 'บาร์รายวัน');
  populateTable(filteredItems, 'stockTableBody', createTableRowForbarday);

  // Attach event listeners for input fields to calculate total
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', calculateTotal);
  });

  handleFormSubmission('stockForm', filteredItems, filterFilledItemsWithTotal, function(filledItems) {
    populateConfirmationTable4(filledItems, 'confirmationTableBody');
  });

  handleFinalSubmit('finalSubmitButton', 'stockForm', filteredItems, async function(items, formId) {
    showLoadingSpinner();

    const formData = new FormData(document.getElementById(formId));
    const filledItems = items.map((item, index) => {
      return {
        name: item.name,
        received: formData.get(`received_${index}`) || "",
        total: formData.get(`total_${index}`) || "",
        barC: formData.get(`barC_${index}`) || "",
        storeC: formData.get(`storeC_${index}`) || "",
        houseSY: formData.get(`houseSY_${index}`) || "",
        barL: formData.get(`barL_${index}`) || "",
        barM: formData.get(`barM_${index}`) || "",
        z: formData.get(`z_${index}`) || "",
        office: formData.get(`office_${index}`) || "",
        customerBorrow: formData.get(`customerBorrow_${index}`) || ""
      };
    });

    const header = `${kitchenType}, ${getCurrentDateTime()}\n`;
    const columnHeaders = 'ชื่อ,จำนวนรับ,รวม,Bar C,Store C,House SY,Bar L,Bar M,Z,Office,Customer Borrow\n';
    const csvContent = header + columnHeaders + filledItems.map(item => [
      `"${item.name}"`,
      `"${item.received}"`,
      `"${item.total}"`,
      `"${item.barC}"`,
      `"${item.storeC}"`,
      `"${item.houseSY}"`,
      `"${item.barL}"`,
      `"${item.barM}"`,
      `"${item.z}"`,
      `"${item.office}"`,
      `"${item.customerBorrow}"`
    ].join(',')).join('\n');

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
        const response = await fetch(getUploadURL(kitchenType), { 
          method: 'POST',
          body: uploadForm
        });
        const result = await response.json();
        hideLoadingSpinner();
        if (result.url) {
          sendLineNotify('barday', result.url);  // Call the new LINE Notify function
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
    hideModal('modalBackdrop', 'confirmationModal');
  });

  function createTableRowForbarday(item, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td><input type="number" name="received_${index}" value="" min="0"></td>
      <td><input type="number" name="total_${index}" value="" readonly style="font-weight: bold; background-color: #f2f2f2;"></td>
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

  function calculateTotal(event) {
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
    document.getElementsByName(`total_${index}`)[0].style.backgroundColor = '#f2f2f2';
  }

  function filterFilledItemsWithTotal(items, formData) {
    return items.map((item, index) => {
      return {
        name: item.name,
        received: formData.get(`received_${index}`) || "",
        total: formData.get(`total_${index}`) || "",
        barC: formData.get(`barC_${index}`) || "",
        storeC: formData.get(`storeC_${index}`) || "",
        houseSY: formData.get(`houseSY_${index}`) || "",
        barL: formData.get(`barL_${index}`) || "",
        barM: formData.get(`barM_${index}`) || "",
        z: formData.get(`z_${index}`) || "",
        office: formData.get(`office_${index}`) || "",
        customerBorrow: formData.get(`customerBorrow_${index}`) || ""
      };
    }).filter(item => item.received || item.total || item.barC || item.storeC || item.houseSY || item.barL || item.barM || item.z || item.office || item.customerBorrow);
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
