import { stockItems } from './stockItems.js';  // Import stockItems
import { 
  getCurrentDateTime, 
  getFormattedDateTime, 
  populateTable, 
  createTableRow2, 
  handleFormSubmission, 
  filterFilledItems, 
  populateConfirmationTable2, 
  showModal, 
  hideModal, 
  handleFinalSubmit,
  getUploadURL,
  sendLineNotify // Import the new function
} from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const timestampField = document.getElementById('timestamp');
  timestampField.value = getCurrentDateTime();

  const pageTitle = document.title;
  const kitchenType = 'นับกล่องรายสัปดาห์';

  const filteredItems = stockItems.filter(item => item.kitchen === kitchenType);
  populateTable(filteredItems, 'stockTableBody', createTableRow2);

  handleFormSubmission('stockForm', filteredItems, filterFilledItems, function(filledItems) {
    populateConfirmationTable2(filledItems, 'confirmationTableBody');
  });

  handleFinalSubmit('finalSubmitButton', 'stockForm', filteredItems, async function(items, formId) {
    showLoadingSpinner();

    const formData = new FormData(document.getElementById(formId));
    const filledItems = items.map((item, index) => {
      return {
        name: item.name,
        type: item.type,
        counting: formData.get(`counting_${index}`) || "",
        numberToOrder: formData.get(`numberToOrder_${index}`) || "",
        unit: item.unit
      };
    });

    const header = `${kitchenType}, ${getCurrentDateTime()}\n`;
    const columnHeaders = 'ชื่อ,,จำนวนนับ,จำนวนสั่ง,หน่วย\n';
    const csvContent = header + columnHeaders + filledItems.map(item => [
      `"${item.name}"`,
      `"${item.type}"`,
      `"${item.counting}"`,
      `"${item.numberToOrder}"`,
      `"${item.unit}"`
    ].join(',')).join('\n');

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
            sendLineNotify('boxstockweek', result.url);  // Call the new LINE Notify function
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
  