// script.js
import { stockItems } from './stockItems.js';

document.addEventListener('DOMContentLoaded', function() {
    const stockTableBody = document.getElementById('stockTableBody');
    const timestampField = document.getElementById('timestamp');

    // Set current date and time
    timestampField.value = new Date().toLocaleString();

    // Populate the table with stock items
    stockItems.forEach((item, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.fixedStock}</td>
            <!-- <td>${item.unit}</td> -->
            <td><input type="number" name="inventoryCount_${index}" placeholder="0"></td>
            <td><input type="number" name="numberToOrder_${index}" placeholder="0"></td>
            <td><input type="number" name="counting_${index}" placeholder="0"></td>
            <td>${item.type}</td>
            <td>${item.kitchen}</td>
        `;

        stockTableBody.appendChild(row);
    });

    // Form submission handler
    document.getElementById('stockForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Show confirmation dialog
        if (confirm('คุณแน่ใจหรือว่าต้องการส่งข้อมูลนี้?')) {
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value || ''; // Make fields optional by allowing empty strings
            });

            // Send data to Google Sheets
            fetch('YOUR_GOOGLE_SHEET_SCRIPT_URL', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(result => {
                alert('ส่งแบบฟอร์มสำเร็จแล้ว!');
                this.reset();
                timestampField.value = new Date().toLocaleString(); // Reset timestamp
            })
            .catch(error => {
                console.error('Error:', error);
                alert('มีข้อผิดพลาดในการส่งแบบฟอร์ม.');
            });
        }
    });
});
