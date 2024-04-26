window.addEventListener('DOMContentLoaded', (event) => {
    const tableBody = document.getElementById('bookingsTable').querySelector('tbody');

    // Fetch the bookings from the server
    fetch('/api/bookings1')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(responseObject => {
            // Access the data property of the response object
            const bookings = responseObject.data;
            // Insert the bookings into the table
            bookings.forEach(booking => {
                // Create a new Date object from the created_at string
                const bookingDate = new Date(booking.created_at);
                // Format the date and time
                const formattedDate = bookingDate.toLocaleDateString('en-US');
                const formattedTime = bookingDate.toLocaleTimeString('en-US');
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.name}</td>
                    <td>${booking.package_id}</td>
                    <td>${formattedDate}</td>
                    <td>${formattedTime}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
});
