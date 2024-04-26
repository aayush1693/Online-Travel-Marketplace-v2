const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const mysql = require('mysql');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(cookieParser());
app.use(session({
  secret: 'a8c90a6f5b4e4b23f89712e80e6cfe2c',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'travel_marketplace'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

let transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'parajuli.aayush@outlook.com',
    pass: 'Aayush24'
  }
});

const verificationCodes = {};

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.js'));
});

app.post('/signup', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { username, email, password, role } = req.body;
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  let query;
  if (role === 'user') {
    query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
  } else if (role === 'business') {
    query = 'INSERT INTO businesses (business_name, email, password_hash) VALUES (?, ?, ?)';
  }

  connection.query(query, [username, email, passwordHash], (err, results) => {
    if (err) {
      res.end(JSON.stringify({ success: false, message: 'Error creating account. Please try again.' }));
      throw err;
    }

    // Generate a verification code
    const verificationCode = Math.floor(Math.random() * 1000000);
    verificationCodes[email] = verificationCode;

    // Send the verification code to the user's email
    transporter.sendMail({
      from: 'parajuli.aayush@outlook.com',
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is ${verificationCode}`
    }, (err, info) => {
      if (err) {
        res.end(JSON.stringify({ success: false, message: 'Error sending verification code. Please try again.' }));
        throw err;
      }

      res.end(
        JSON.stringify({
          success: true,
          message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully! Please check your email for the verification code.`,
        })
      );
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  connection.query(
    `SELECT * FROM users WHERE email = ? AND password_hash = ?`,
    [email, passwordHash],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        req.session.username = results[0].username; // Store the username from the database in the session
        res.end(JSON.stringify({ success: true, message: 'Successfully logged in!' }));
      } else {
        res.end(JSON.stringify({ success: false, message: 'Invalid email or password!' }));
      }
    }
  );
});


app.post('/verify', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { email, code } = req.body;

  // Check if the code is valid
  if (verificationCodes[email] === Number(code)) {
    delete verificationCodes[email]; // Remove the verification code
    res.end(JSON.stringify({ success: true, message: 'Verification successful!' }));
  } else {
    res.end(JSON.stringify({ success: false, message: 'Invalid verification code.' }));
  }
});

app.post('/reset_password', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { passwordResetToken, newPassword } = req.body;
  const newPasswordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

  // Update the user's password if the password reset token is valid and has not expired
  connection.query('UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE password_reset_token = ? AND password_reset_expires > ?', [newPasswordHash, passwordResetToken, Date.now()], (err, results) => {
    if (err) throw err;

    if (results.affectedRows > 0) {
      // Password was reset successfully
      res.end(JSON.stringify({ success: true, message: 'Password reset successfully. You can now log in with your new password.' }));
    }  else {
      res.end(JSON.stringify({ success: false, message: 'Password reset token is invalid or has expired.' }));
    }
  });
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset_password.html'));
});

app.post('/reset_password_request', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { email } = req.body;

  // Generate a password reset token
  const passwordResetToken = crypto.randomBytes(20).toString('hex');

  // Set the password reset token and its expiry time in the database
  connection.query('UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?', [passwordResetToken, Date.now() + 3600000, email], (err, results) => {
    if (err) throw err;

    if (results.affectedRows > 0) {
      // Send the password reset token to the user's email
      transporter.sendMail({
        from: 'parajuli.aayush@outlook.com',
        to: email,
        subject: 'Password Reset Token',
        html: `
          <h1>Password Reset</h1>
          <p>You have requested to reset your password.</p>
          <p>Your password reset token is: <strong>${passwordResetToken}</strong></p>
          <p>You can reset your password by clicking the link below:</p>
          <a href="http://localhost:3000/reset-password?token=${passwordResetToken}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block;">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email.</p>
        `,
      }, (err, info) => {
        if (err) throw err;

        res.end(JSON.stringify({ success: true, message: 'Password reset token sent to your email.' }));
      });
    } else {
      res.end(JSON.stringify({ success: false, message: 'No account with that email address exists.' }));
    }
  });
});

app.get('/reset_password.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset_password.js'));
});

app.get('/getUsername', (req, res) => {
  if (req.session && req.session.username) {
    console.log(req.session.username);
    res.json({ username: req.session.username });
  } else {
    res.json({ username: null });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
