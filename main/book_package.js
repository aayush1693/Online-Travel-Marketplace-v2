window.addEventListener('DOMContentLoaded', (event) => {
    // Add an event listener to the booking form
    const bookingForm = document.getElementById('book-package-form');
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get the form data
        const formData = new FormData(bookingForm);

        // Send the booking details to the server
        fetch('/api/bookings', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
    });
});