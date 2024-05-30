import { stockItems } from './stockItems.js';
import { 
  getCurrentDateTime, 
  getFormattedDateTime, 
  populateTable, 
  createTableRow3, 
  handleFormSubmission, 
  filterFilledItems, 
  populateConfirmationTable, 
  showModal, 
  hideModal, 
  handleFinalSubmit,
  getUploadURL // Ensure this is correctly imported
} from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const timestampField = document.getElementById('timestamp');
  timestampField.value = getCurrentDateTime();

  const pageTitle = document.title;
  const kitchenType = 'นับกล่องรายสัปดาห์';

  const filteredItems = stockItems.filter(item => item.kitchen === 'นับกล่องรายสัปดาห์');
  populateTable(filteredItems, 'stockTableBody', createTableRow3);

  handleFormSubmission('stockForm', filteredItems, filterFilledItems, function(filledItems) {
    populateConfirmationTable(filledItems, 'confirmationTableBody');
  });

  handleFinalSubmit('finalSubmitButton', 'stockForm', filteredItems, async function(items, formId) {
    showLoadingSpinner();

    const formData = new FormData(document.getElementById(formId));
    const filledItems = items.map((item, index) => {
      return {
        name: item.name,
        // fixedStock: item.fixedStock,
        unit: item.unit,
        inventoryCount: formData.get(`inventoryCount_${index}`) || "",
        numberToOrder: formData.get(`numberToOrder_${index}`) || "",
        counting: formData.get(`counting_${index}`) || "",
        // type: item.type,
        // kitchen: item.kitchen
      };
    });

    const header = `${kitchenType}, ${getCurrentDateTime()}\n`;
    const columnHeaders = 'ชื่อ,หน่วย,ยอดคงเหลือ,ยอดสั่งซื้อ,ยอดรับเข้า\n';
    const csvContent = header + columnHeaders + filledItems.map(item => [
      `"${item.name}"`,
    //   `"${item.fixedStock}"`,
      `"${item.unit}"`,
      `"${item.inventoryCount}"`,
      `"${item.numberToOrder}"`,
      `"${item.counting}"`,
    //   `"${item.type}"`,
    //   `"${item.kitchen}"`
    ].join(',')).join('\n');

    // Add BOM character
    const bom = '\uFEFF';
    const finalCsvContent = bom + csvContent;

    const blob = new Blob([finalCsvContent], { type: 'text/csv;charset=utf-8;' });
    const reader = new FileReader();

    reader.onload = async function(event) {
      const base64data = btoa(event.target.result);
      const fileName = `${getFormattedDateTime()}_นับสต๊อก_กล่อง_รายสัปดาห์.csv`;

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
          window.location.href = `complete.html?fileUrl=${encodeURIComponent(result.url)}&formType=boxstockweek`;
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

  // Show the loading spinner
  function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
  }

  // Hide the loading spinner
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

  document.getElementById('navigateButton').addEventListener('click', function() {
    if (confirm('คุณแน่ใจหรือว่าต้องการไปหน้านับสต๊อก ครัวไทย?')) {
      window.location.href = 'thai.html';
    }
  });

  document.getElementById('homeButton').addEventListener('click', function() {
    if (confirm('คุณแน่ใจหรือว่าต้องการกลับไปหน้าแรก?')) {
      window.location.href = 'index.html';
    }
  });

});
