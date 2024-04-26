document.getElementById('reset-password-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Extract the password reset token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const passwordResetToken = urlParams.get('token');

    fetch('/reset_password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            passwordResetToken: passwordResetToken,
            newPassword: newPassword,
        }),
    })
    .then(response => {
        console.log(response); // Log the entire response for debugging
    
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            window.location.href = '/register.html';        }
    })
    .then(json => {
        alert(json.message);
    
        if (json.success) {
            // Redirect to the login page
            window.location.href = '/register.html';
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
});   