// Function to toggle between signup and login forms
function toggleForms(event) {
  event.preventDefault();
  
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');

  if (signupForm.style.display === 'none') {
      signupForm.style.display = 'block';
      loginForm.style.display = 'none';
  } else {
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
  }
}

document.getElementById('switchToLogin').addEventListener('click', toggleForms);
document.getElementById('switchToSignup').addEventListener('click', toggleForms);

// Function to validate signup form
function validateSignup(event) {
  event.preventDefault();

  var username = document.getElementById('username').value;
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  var reenterPassword = document.getElementById('confirmPassword').value;
  var role = document.querySelector('input[name="role"]:checked').value;

  if (password !== reenterPassword) {
    alert('Passwords do not match!');
    return;
  }

  if (!username || !email || !password) {
    alert('All fields are required!');
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/signup', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    username: username,
    email: email,
    password: password,
    role: role
  }));

  xhr.onload = function() {
    var response = JSON.parse(this.responseText);
    if (response.success) {
      // If the signup was successful, show the verification form and hide the signup form
      document.getElementById('signupForm').style.display = 'none';
      document.getElementById('verificationForm').style.display = 'block';
      
    } else {
      alert(response.message);
    }
  };

  xhr.onerror = function() {
    alert('Request failed');
  };
}

document.getElementById('signupButton').addEventListener('click', validateSignup);

// Function to validate login form
function validateLogin(event) {
    event.preventDefault();

    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      alert('All fields are required!');
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      username: username,
      email: email,
      password: password,
    }));

    xhr.onload = function() {
      var response = JSON.parse(this.responseText);
      if (response.success) {
        window.location.href = 'index.html';
      } else {
        alert(response.message);
      }
    };

    xhr.onerror = function() {
      alert('Request failed');
    };
}

document.getElementById('loginButton').addEventListener('click', validateLogin);

// Function to validate verification form
function validateVerification(event) {
  console.log('validateVerification called'); // Add this line
  event.preventDefault();
  if (event.target !== document.getElementById('verifyButton')) {
    return; // If the event target is not the verifyButton, do nothing
  }
  var verificationCode = document.getElementById('verificationCode').value;
  var email = document.getElementById('email').value; // Get the email from the signup form

  if (!verificationCode) {
    alert('Verification code is required!');
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/verify', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    email: email,
    code: verificationCode
  }));

  xhr.onload = function() {
    var response = JSON.parse(this.responseText);
    if (response.success) {
      window.location.href = '/index.html';
    } else {
      alert(response.message);
    }
  };

  xhr.onerror = function() {
    alert('Request failed');
  };
}
document.getElementById('switchToReset').addEventListener('click', function(event) {
  event.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('passwordResetRequestForm').style.display = 'block';
});

// Switch to the login form when the "Login" link in the password reset request form is clicked
document.getElementById('switchToLoginFromReset').addEventListener('click', function(event) {
  event.preventDefault();
  document.getElementById('passwordResetRequestForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
});
// Handle the password reset request form submission
document.getElementById('resetButton').addEventListener('click', function(event) {
  event.preventDefault();
  var email = document.getElementById('resetEmail').value;

  // Send a POST request to your server with the user's email address
  fetch('/reset_password_request', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          // If the server responded with success, display the reset instructions
          document.getElementById('passwordResetRequestForm').style.display = 'none';
          // Assuming you have a div with id 'resetInstructions' for displaying the reset instructions
          document.getElementById('resetError').style.display = 'none';
          document.getElementById('resetInstructions').style.display = 'block';
          document.getElementById('resetInstructions').innerText = data.message;
      } else {
          // If the server responded with an error, display the error message
          // Assuming you have a div with id 'resetError' for displaying the error message
          document.getElementById('resetInstructions').style.display = 'none';
          document.getElementById('resetError').style.display = 'block';
          document.getElementById('resetError').innerText = data.message;
      }
  })
  .catch((error) => {
      console.error('Error:', error);
  });
});
document.getElementById('verifyButton').addEventListener('click', validateVerification);