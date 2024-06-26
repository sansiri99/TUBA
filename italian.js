import { stockItems } from './stockItems.js';  // Import stockItems
import { 
  getCurrentDateTime, 
  getFormattedDateTime, 
  populateTable, 
  createTableRow, 
  handleFormSubmission, 
  filterFilledItems, 
  populateConfirmationTable, 
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
  const kitchenType = 'ครัวอิตาเลี่ยน';

  const filteredItems = stockItems.filter(item => item.kitchen === kitchenType);
  populateTable(filteredItems, 'stockTableBody', createTableRow);

  handleFormSubmission('stockForm', filteredItems, filterFilledItems, function(filledItems) {
    populateConfirmationTable(filledItems, 'confirmationTableBody');
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
        name: item.name,
        unit: item.unit,
        counting: formData.get(`counting_${index}`) || "",
        numberToOrder: formData.get(`numberToOrder_${index}`) || "",
        type: item.type,
        kitchen: item.kitchen
      };
    });

    const header = `${kitchenType}, ${getCurrentDateTime()},ผู้กรอกข้อมูล: ${employeeName}\n`;
    const columnHeaders = 'ชื่อ,จำนวนนับ,จำนวนสั่ง,หน่วย\n';
    const csvContent = header + columnHeaders + filledItems.map(item => [
      `"${item.name}"`,
      `"${item.counting}"`,
      `"${item.numberToOrder}"`,
      `"${item.unit}"`,
    ].join(',')).join('\n');

    const bom = '\uFEFF';
    const finalCsvContent = bom + csvContent;

    const blob = new Blob([finalCsvContent], { type: 'text/csv;charset=utf-8;' });
    const reader = new FileReader();

    reader.onload = async function(event) {
      const base64data = btoa(event.target.result);
      const fileName = `${getFormattedDateTime()}_นับสต๊อก_ครัว_อิตาเลี่ยน.csv`;

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
            sendLineNotify('italian', result.url, employeeName);  // Pass the employee name to LINE Notify function
            window.location.href = `complete.html?fileUrl=${encodeURIComponent(result.url)}&formType=italian&employeeName=${encodeURIComponent(employeeName)}`;
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
  