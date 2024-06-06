// utils.js

// Google script for csv generator+upload to drive
// https://script.google.com/home/projects/1K2xPCeozqDysOxC-SwCj6cMqkFE3--xqm_ZcFhChWMbNWMdGFi2pl0wZ/edit
export function getUploadURL(kitchenType) {
  const folderIds = {
    'testthai': '1q2M3C-wLUxD5x35uqKUuA27-_aTGbleH',
    'testbarday': '1q2M3C-wLUxD5x35uqKUuA27-_aTGbleH',

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
    <td>${item.unit}</td>
    <td><input type="number" step="0.1" name="counting_${index}" placeholder=""></td>
    <td><input type="number" step="0.1" name="numberToOrder_${index}" placeholder=""></td>
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
      <td class="bold-text">${item.counting}</td>
      <td class="bold-text">${item.numberToOrder}</td>
      <td>${item.unit}</td>
    `;
    tableBody.appendChild(row);
  });
}


// barday fruit + นับกล่องรายสัปดาห์ + barweek

export function createTableRow2(item, index) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.name}</td>
    <td>${item.unit}</td>
    <td><input type="number" step="0.1" name="counting_${index}" placeholder=""></td>
    <td><input type="number" step="0.1" name="numberToOrder_${index}" placeholder=""></td>
  `;
  return row;
}

export function populateConfirmationTable2(items, tableBodyId) {
  const tableBody = document.getElementById(tableBodyId);
  tableBody.innerHTML = '';

  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td class="bold-text">${item.counting}</td>
      <td class="bold-text">${item.numberToOrder}</td>
      <td>${item.unit}</td>
    `;
    tableBody.appendChild(row);
  });
}


//

export function createTableRow3(item, index) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.name}</td>
    <td>${item.unit}</td>
    <td><input type="number" step="0.1" name="inventoryCount_${index}" placeholder=""></td>
    <td><input type="number" step="0.1" name="numberToOrder_${index}" placeholder=""></td>
    <td><input type="number" step="0.1" name="counting_${index}" placeholder=""></td>
  `;
  return row;
}


// barday 

export function populateConfirmationTable4(items, tableBodyId) {
  const tableBody = document.getElementById(tableBodyId);
  tableBody.innerHTML = '';

  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.received}</td>
      <td>${item.total}</td>
      <td>${item.barC}</td>
      <td>${item.storeC}</td>
      <td>${item.houseSY}</td>
      <td>${item.barL}</td>
      <td>${item.barM}</td>
      <td>${item.z}</td>
      <td>${item.office}</td>
      <td>${item.customerBorrow}</td>
    `;
    tableBody.appendChild(row);
  });
}

export function filterFilledItemsWithTotal(items, formData) {
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


// บุหรี่รายวัน

export function populateConfirmationTable5(items, tableBodyId) {
  const tableBody = document.getElementById(tableBodyId);
  tableBody.innerHTML = '';

  items.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td>${item.received}</td>
      <td>${item.total}</td>
      <td>${item.barC}</td>
      <td>${item.storeC}</td>
    `;
    tableBody.appendChild(row);
  });
}

export function filterFilledItemsWithTotal1(items, formData) {
  return items.map((item, index) => {
    return {
      code: item.code,
      name: item.name,
      received: formData.get(`received_${index}`) || "",
      total: formData.get(`total_${index}`) || "",
      barC: formData.get(`barC_${index}`) || "",
      storeC: formData.get(`storeC_${index}`) || ""

    };
  }).filter(item => item.received || item.total || item.barC || item.storeC );
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
      unit: item.unit,
      counting: formData.get(`counting_${index}`),
      numberToOrder: formData.get(`numberToOrder_${index}`),
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

// LINE Notify API
export function sendLineNotify(formType, fileUrl, employeeName) {
  fetch(`https://script.google.com/macros/s/AKfycbzBYOzo-CJEe74Oti_IIaFiyd2orP540Y_g-iNoVsjkmwNZHoJBSHk92iVNkbS68fHS/exec?formType=${formType}&fileUrl=${fileUrl}&employeeName=${employeeName}`, {
      method: 'GET',
      mode: 'no-cors'
  }).then(response => {
      console.log('Message sent');
  }).catch(error => {
      console.error('Error:', error);
  });
}
