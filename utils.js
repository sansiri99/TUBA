// utils.js

// Google script for csv generator+upload to drive
// https://script.google.com/home/projects/1K2xPCeozqDysOxC-SwCj6cMqkFE3--xqm_ZcFhChWMbNWMdGFi2pl0wZ/edit
export function getUploadURL(kitchenType) {
  // Define the folder IDs
  const folderIds = {
    'ของแห้งรายสัปดาห์':'1m40yPJrErLHKS3feLon7zCftzubl9VJC',
    'นับกล่องรายสัปดาห์':'1zgwHTJ8us1ZLvnau8Nc7h-hovZy1dI_n',
    'สูญเสีย':'11mZm4gnidDvkBRj6IwBj-L-VJJ2Rw_BA',
    'ครัวไทย': '1c_BLLONGky1c1ioMP7NKoC34R6crpzLj',
    'ครัวอิตาเลี่ยน': '1KI5uWmOpoWElMRYnarQhwZiv0cH2-qNC',
    'บาร์รายวัน': '1s1aa5EMVyFFKmS0N4i37lkjTJaCE8Sen',
    'บาร์รายวันบุหรี่':'1dDwfWkn4-joycKcAJbsoXCSbzaY0ks4I',
    'บาร์รายวันผลไม้สด':'1F2QpxI7TflAkocv7HVKw6rBeXaC_MlGg',
    'บาร์รายสัปดาห์': '1t_6rrr-Js-KE9FVDbuNNZ_GOb2N8oNrW'
  };

  // Return the upload URL with the folder ID parameter
  const folderId = folderIds[kitchenType];
  return `https://script.google.com/macros/s/AKfycbxG0Llm364WD1HMGl8AeIqDKWctsAdQR9actqhp8g1Fu8wVEO1VdEV2PWttQ4CeyUs7/exec?folderId=${folderId}`;
}

export function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleString();
}

export function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
}

export function populateTable(items, tableBodyId, createRow) {
  const tableBody = document.getElementById(tableBodyId);
  tableBody.innerHTML = '';

  items.forEach((item, index) => {
    const row = createRow(item, index);
    tableBody.appendChild(row);
  });
}

export function createTableRow(item, index) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.name}</td>
    <td>${item.fixedStock}</td>
    <td>${item.unit}</td>
    <td><input type="number" step="0.1" name="inventoryCount_${index}" placeholder=""></td>
    <td><input type="number" step="0.1" name="numberToOrder_${index}" placeholder=""></td>
    <td><input type="number" step="0.1" name="counting_${index}" placeholder=""></td>
    <td>${item.type}</td>
    <td>${item.kitchen}</td>
  `;
  return row;
}

export function populateConfirmationTable(items, tableBodyId) {
  const tableBody = document.getElementById(tableBodyId);
  tableBody.innerHTML = '';

  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.unit}</td>
      <td class="bold-text">${item.inventoryCount}</td>
      <td class="bold-text">${item.numberToOrder}</td>
      <td class="bold-text">${item.counting}</td>
    `;
    tableBody.appendChild(row);
  });
}


// barday fruit
export function createTableRow2(item, index) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.name}</td>
    <td>${item.unit}</td>
    <td><input type="number" name="counting_${index}" placeholder=""></td>
  `;
  return row;
}
// barday fruit
export function populateConfirmationTable2(items, tableBodyId) {
  const tableBody = document.getElementById(tableBodyId);
  tableBody.innerHTML = '';

  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td class="bold-text">${item.counting}</td>
      <td>${item.unit}</td>
    `;
    tableBody.appendChild(row);
  });
}

//นับกล่องรายสัปดาห์
export function createTableRow3(item, index) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.name}</td>
    <td>${item.unit}</td>
    <td><input type="number" name="inventoryCount_${index}" placeholder=""></td>
    <td><input type="number" name="numberToOrder_${index}" placeholder=""></td>
    <td><input type="number" name="counting_${index}" placeholder=""></td>
  `;
  return row;
}


export function handleFormSubmission(formId, items, filterItems, populateConfirmationTable) {
  document.getElementById(formId).addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const filledItems = filterItems(items, formData);
    populateConfirmationTable(filledItems);
    showModal('modalBackdrop', 'confirmationModal');
  });
}

export function filterFilledItems(items, formData) {
  return items.map((item, index) => {
    return {
      name: item.name,
      fixedStock: item.fixedStock,
      unit: item.unit,
      inventoryCount: formData.get(`inventoryCount_${index}`),
      numberToOrder: formData.get(`numberToOrder_${index}`),
      counting: formData.get(`counting_${index}`),
      type: item.type,
      kitchen: item.kitchen,
      index: index
    };
  }).filter(item => item.inventoryCount || item.numberToOrder || item.counting);
}




export function showModal(backdropId, modalId) {
  document.getElementById(backdropId).style.display = 'block';
  document.getElementById(modalId).style.display = 'block';
}

export function hideModal(backdropId, modalId) {
  document.getElementById(backdropId).style.display = 'none';
  document.getElementById(modalId).style.display = 'none';
}

export function handleFinalSubmit(buttonId, formId, items, callback) {
  document.getElementById(buttonId).addEventListener('click', function() {
    callback(items, formId);
  });
}
