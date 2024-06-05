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
    const filledItems = items.map((item, index) => {
      return {
        name: item.name,
        fixedStock: item.fixedStock,
        unit: item.unit,
        inventoryCount: formData.get(`inventoryCount_${index}`) || "",
        numberToOrder: formData.get(`numberToOrder_${index}`) || "",
        counting: formData.get(`counting_${index}`) || "",
        type: item.type,
        kitchen: item.kitchen
      };
    });

    const header = `${kitchenType}, ${getCurrentDateTime()}\n`;
    const columnHeaders = 'ชื่อ,นับสินค้าคงคลัง,จำนวนที่ต้องการสั่งซื้อ,จำนวนนับ,หน่วย,ประเภท,ครัว\n';
    const csvContent = header + columnHeaders + filledItems.map(item => [
      `"${item.name}"`,
      `"${item.inventoryCount}"`,
      `"${item.numberToOrder}"`,
      `"${item.counting}"`,
      `"${item.unit}"`,
      `"${item.type}"`,
      `"${item.kitchen}"`
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
            sendLineNotify('italian', result.url);  // Call the new LINE Notify function
            window.location.href = `complete.html?fileUrl=${encodeURIComponent(result.url)}&formType=italian`;
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
  