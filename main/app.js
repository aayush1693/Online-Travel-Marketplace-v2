const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path'); // Import the 'path' module

const app = express();

app.use(cookieParser());
app.use(session({
  secret: 'a8c90a6f5b4e4b23f89712e80e6cfe2c',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // appending extension
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});
app.get('/', (req, res) => {
  res.redirect('/register.html');
});
app.get('/setRegistered', (req, res) => {
  req.session.registered = true;
  res.end(JSON.stringify({ success: true, message: 'Registered flag set.' }));
});

app.get('/checkRegistered', (req, res) => {
  if (req.session && req.session.registered !== true) {
      res.redirect('/register.html');
  } else {
      res.end(JSON.stringify({ success: true, message: 'User is registered.' }));
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err) {
      return console.log(err);
    }
    res.redirect('/');
  });
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.js'));
});
app.get('/list_packages.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'list_packages.html'));
});
// app.get('/list_packages.js', (req, res) => {
//   res.sendFile(path.join(__dirname, 'list_packages.js'));
// });
app.get('/browse_packages.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'browse_packages.html'));
});

app.get('/browse_packages.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'browse_packages.js'));
});

app.get('/list_packages.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'list_packages.js'));
});

app.get('/list_packages.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'list_packages.html'));
});

app.get('/view_bookings.html', (req, res) => {  
  res.sendFile(path.join(__dirname, 'view_bookings.html'));
});

app.get('/view_bookings.js', (req, res) => {   
  res.sendFile(path.join(__dirname, 'view_bookings.js'));
});

app.post('/signup', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { username, email, password, role } = req.body;
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  // Check if user or business already exists
  connection.query('SELECT email, password_hash FROM users WHERE email = ? UNION SELECT email, password_hash FROM businesses WHERE email = ?', [email, email], (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
          // User or business already exists
          res.end(JSON.stringify({ success: false, message: 'User or business already exists. Please login.' }));
      } else {
          // User or business does not exist, proceed with signup
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
              
              const verificationCode = Math.floor(Math.random() * 1000000);
              verificationCodes[email] = verificationCode;

              transporter.sendMail({
                  from: 'parajuli.aayush@outlook.com',
                  to: email,
                  subject: 'Verification Code',
                  html: `<!DOCTYPE html>
                  <html>
                  <head>
                  <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    padding: 20px;
                  }
                  
                  .container {
                    background-color: #fff;
                    border-radius: 10px;
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                  }
                  
                  h2 {
                    color: #4466cc;
                  }
                  
                  p {
                    font-size: 18px;
                  }
                  
                  .code {
                    background-color: purple;
                    color: #fff;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 20px;
                    text-align: center;
                    margin-top: 20px;
                  }
                  </style>
                  </head>
                  <body>
                  
                  <div class="container">
                    <h2>Welcome to Our Service!</h2>
                    <p>Your verification code is:</p>
                    <div class="code">${verificationCode}</div>
                    <p style="color: #999;">Best regards,</p>
                    <p style="color: #999;">The Travel Marketplace Team</p>
                  </div>
                  
                  </body>
                  </html>
                  `
              }, (err, info) => {
                  if (err) {
                      res.end(JSON.stringify({ success: false, message: 'Error sending verification code. Please try again.' }));
                      throw err;
                  }
                  req.session.email = email; // Set the session username
                  req.session.username = username; // Set the session username
                  req.session.user_id = results.insertId; // Add this line
                  res.end(
                      JSON.stringify({
                          success: true,
                          message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully! Please check your email for the verification code.`,
                      })
                  );
              });
          });
      }
  });
});



app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  // Query for users
  connection.query(
    `SELECT * FROM users WHERE email = ? AND password_hash = ?`,
    [email, passwordHash],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        req.session.email = email;
        req.session.username = results[0].username;
        req.session.user_id = results[0].id;
        res.end(JSON.stringify({ success: true, message: 'Successfully logged in!' }));
      } else {
        // If not found in users, query for businesses
        connection.query(
          `SELECT * FROM businesses WHERE email = ? AND password_hash = ?`,
          [email, passwordHash],
          (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
              req.session.email = email;
              req.session.username = results[0].business_name; // Use business_name for businesses
              req.session.user_id = results[0].id;
              res.end(JSON.stringify({ success: true, message: 'Successfully logged in!' }));
            } else {
              res.end(JSON.stringify({ success: false, message: 'Invalid email or password!' }));
            }
          }
        );
      }
    }
  );
});


app.post('/verify', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { email, code } = req.body;

  if (verificationCodes[email] === Number(code)) {
    connection.query(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        (err, results) => {
          if (err) throw err;
    
          if (results.length > 0) {
            req.session.username = results[0].username;
          } 
        }
      );
    delete verificationCodes[email];
    res.end(JSON.stringify({ success: true, message: 'Verification successful!' }));
  } else {
    res.end(JSON.stringify({ success: false, message: 'Invalid verification code.' }));
  }
});

app.post('/reset_password', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { passwordResetToken, newPassword } = req.body;
  const newPasswordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

  // Update both users and businesses tables
  connection.query('UPDATE users, businesses SET users.password_hash = ?, users.password_reset_token = NULL, users.password_reset_expires = NULL, businesses.password_hash = ?, businesses.password_reset_token = NULL, businesses.password_reset_expires = NULL WHERE (users.password_reset_token = ? OR businesses.password_reset_token = ?) AND (users.password_reset_expires > ? OR businesses.password_reset_expires > ?)', [newPasswordHash, newPasswordHash, passwordResetToken, passwordResetToken, Date.now(), Date.now()], (err, results) => {
    if (err) throw err;

    if (results.affectedRows > 0) {
      res.end(JSON.stringify({ success: true, message: 'Password reset successfully. You can now log in with your new password.' }));
    }  else {
      res.end(JSON.stringify({ success: false, message: 'Password reset token is invalid or has expired.' }));
    }
  });
});

app.post('/reset_password_request', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const { email } = req.body;

  const passwordResetToken = crypto.randomBytes(20).toString('hex');

  // Update both users and businesses tables
  connection.query('UPDATE users, businesses SET users.password_reset_token = ?, users.password_reset_expires = ?, businesses.password_reset_token = ?, businesses.password_reset_expires = ? WHERE users.email = ? OR businesses.email = ?', [passwordResetToken, Date.now() + 3600000, passwordResetToken, Date.now() + 3600000, email, email]
  , (err, results) => {
    if (err) throw err;

    if (results.affectedRows > 0) {
      transporter.sendMail({
        from: 'parajuli.aayush@outlook.com',
        to: email,
        subject: 'Password Reset Token',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f0f0;
          padding: 20px;
        }
        
        .container {
          background-color: #fff;
          border-radius: 10px;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        h1 {
          color: #4466cc;
        }
        
        p {
          font-size: 18px;
        }
        
        a.reset-button {
          background-color: #4CAF50;
          color: white;
          padding: 14px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          margin-top: 20px;
        }
        </style>
        </head>
        <body>
        
        <div class="container">
          <h1>Password Reset</h1>
          <p>You have requested to reset your password.</p>
          <p>You can reset your password by clicking the link below:</p>
          <a href="http://localhost:3000/reset-password?token=${passwordResetToken}" class="reset-button">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        
        </body>
        </html>
        
        `
      }, (err, info) => {
        if (err) throw err;

        res.end(JSON.stringify({ success: true, message: 'Password reset token sent to your email.' }));
      });
    } else {
      res.end(JSON.stringify({ success: false, message: 'No account with that email address exists.' }));
    }
  });
});

app.post('/api/services', upload.single('image'), (req, res) => {
  const service = req.body;
  const image = req.file;

  if (!image) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  // Fetch the business name from the session
  const businessName = req.session.username;

  const query = 'INSERT INTO services (business_name, name, description, price, date, time, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const params = [businessName, service.name, service.description, service.price, service.date, service.time, image.filename];

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }

    res.json({ success: true, data: service, file: image });
  });
});


app.post('/api/edit_package', (req, res) => {
  const { id, name, description, price, date, time } = req.body;
  const businessName = req.session.username; // Ensure the user is logged in as a business
  const query = 'UPDATE services SET name = ?, description = ?, price = ? WHERE id = ? AND business_name = ?';
  
  connection.query(query, [name, description, price, id, businessName], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Package not found or no changes detected' });
      return;
    }
    res.json({ success: true, message: 'Package updated successfully' });
  });
});


app.get('/api/packages1', (req, res) => {
  // Get the user from the session
  const user = req.session.username;
  // Query the database for the packages created by the user
  const query = 'SELECT * FROM services WHERE business_name = ?';
  connection.query(query, [user], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'An error occurred while fetching the packages.' });
      return;
    }

    res.json({ success: true, data: results });
  });
});

app.get('/api/packages', (req, res) => {
  const query = 'SELECT * FROM services';
  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }

    res.json({ success: true, data: results });
  });
});


app.post('/api/reviews', (req, res) => {
  const { package_id,rating, review } = req.body;
  const user_id = req.session.username; // Assuming the session contains the username

 

  const query = 'INSERT INTO reviews (user_id, package_id, rating, review) VALUES (?, ?, ?, ?)';
  const params = [user_id, package_id, rating, review];

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }

    res.json({ success: true, data: review });
  });
});




app.post('/api/bookings', (req, res) => {
  const { package, business } = req.body;
  let email = req.session.email; // Set the session username
  let username = req.session.username;
  const query = 'INSERT INTO bookings (name, email, business_name, package_id) VALUES (?, ?, ?, ?)';
  const params = [username, email, business, package];

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }

    let transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: 'parajuli.aayush@outlook.com',
        pass: 'Aayush24'
      }
    });

    let businessQuery = 'SELECT * FROM businesses WHERE business_name = ?'; // Changed variable name here
    connection.query(businessQuery, [business], (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Database error' });
        return;
      }

      if (rows.length > 0) {
        let business_email = rows[0].email;

        // Fetch the package details
        let packageQuery = 'SELECT * FROM services WHERE name = ?';
        connection.query(packageQuery, [package], (err, packageRows) => {
          if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
          }

          if (packageRows.length > 0) {
            let packageName = packageRows[0].name;
            let packageDescription = packageRows[0].description;
            let packagePrice = packageRows[0].price;
            let packageDate = packageRows[0].date;
            let packageTime = packageRows[0].time;

            let mailOptions = {
              from: 'parajuli.aayush@outlook.com',
              to: email,
              subject: 'Booking Receipt',
              html: `
              <!DOCTYPE html>
              <html>
              <head>
              <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                padding: 20px;
              }
              
              .container {
                background-color: #fff;
                border-radius: 10px;
                padding: 20px;
                max-width: 600px;
                margin: 0 auto;
              }
              
              h1 {
                color: #444;
              }
              
              p {
                font-size: 18px;
              }
              
              p.regular {
                color: #666;
              }
              
              p.signature {
                color: #999;
              }
              </style>
              </head>
              <body>
              
              <div class="container">
                <h1>Thank you for booking a package, ${username}!</h1>
                <p class="regular">We have received your booking for package ID: ${package}.</p>
                <p class="regular">Package Name: ${packageName}</p>
                <p class="regular">Package Description: ${packageDescription}</p>
                <p class="regular">Package Price: ${packagePrice}</p>
                <p class="regular">Package Date: ${packageDate}</p>
                <p class="regular">Package Time: ${packageTime}</p>
                <p class="regular">A confirmation email has been sent to your email address: ${email}.</p>
                <p class="regular">If you have any questions, please reply to this email.</p>
                <p class="signature">Best regards,</p>
                <p class="signature">The Travel Marketplace Team</p>
              </div>
              
              </body>
              </html>
              
              `
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Email error' });
                return;
              }

              let providerMailOptions = {
                from: 'parajuli.aayush@outlook.com',
                to: business_email,
                subject: 'New Booking',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f0f0f0;
                  padding: 20px;
                }
                
                .container {
                  background-color: #fff;
                  border-radius: 10px;
                  padding: 20px;
                  max-width: 600px;
                  margin: 0 auto;
                }
                
                h1 {
                  color: #444;
                }
                
                p {
                  font-size: 18px;
                }
                
                p.regular {
                  color: #666;
                }
                
                p.signature {
                  color: #999;
                }
                </style>
                </head>
                <body>
                
                <div class="container">
                  <h1>New Booking Received</h1>
                  <p class="regular">A new booking has been made by ${username} for package ID: ${package}.</p>
                  <p class="regular">Package Name: ${packageName}</p>
                  <p class="regular">Package Description: ${packageDescription}</p>
                  <p class="regular">Package Price: ${packagePrice}</p>
                  <p class="regular">Package Date: ${packageDate}</p>
                  <p class="regular">Package Time: ${packageTime}</p>
                  <p class="regular">The user's email address is: ${email}.</p>
                  <p class="signature">Best regards,</p>
                  <p class="signature">The Travel Marketplace Team</p>
                </div>
                
                </body>
                </html>
                
                `
              };

              transporter.sendMail(providerMailOptions, (error, info) => {
                if (error) {
                  console.error(error);
                  res.status(500).json({ success: false, message: 'Email error' });
                  return;
                }

                res.json({ success: true, data: booking });
              });
            });
          } else {
            res.status(404).json({ success: false, message: 'Package not found' });
          }
        });
      } else {
        res.status(404).json({ success: false, message: 'Business not found' });
      }
    });
  });
});



app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset_password.html'));
});

app.get('/reset_password.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset_password.js'));
});

app.get('/list_service.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'list_service.html'));
});

app.get('/list_service.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'list_service.js'));
  });


app.get('/getUsername', (req, res) => {
    if (req.session && req.session.username) {
        console.log(req.session.username);
        res.json({ username: req.session.username });
    } else {
        res.json({ username: null });
    }
});
app.get('/getRole', (req, res) => {
    if (req.session && req.session.username) {
        let query = 'SELECT * FROM users WHERE username = ?';
        connection.query(query, [req.session.username], (err, rows) => {
            if (err) {
                return console.error(err.message);
            }
            if (rows.length > 0) {
                res.json({ role: 'User' });
            } else {
                query = 'SELECT * FROM businesses WHERE business_name = ?';
                connection.query(query, [req.session.username], (err, rows) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    if (rows.length > 0) {
                        res.json({ role: 'Business' });
                    } else {
                        res.json({ role: 'User' }); // Default role
                    }
                });
            }
        });
    } else {
        res.json({ role: 'User' }); // Default role
    }
});
    
// Endpoint to edit a package
app.post('/api/edit_package', (req, res) => {
  const { id, name, description, price, date, time } = req.body;
  const businessName = req.session.username; // Ensure the user is logged in as a business
  const query = 'UPDATE services SET name = ?, description = ?, price = ?, date = ?, time = ? WHERE id = ? AND business_name = ?';
  connection.query(query, [name, description, price, date, time, id, businessName], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }
    res.json({ success: true, message: 'Package updated successfully' });
  });
});

// Endpoint to delete a package
app.delete('/api/delete_package/:id', (req, res) => {
  const { id } = req.params;
  const businessName = req.session.username; // Ensure the user is logged in as a business
  const query = 'DELETE FROM services WHERE id = ? AND business_name = ?';
  connection.query(query, [id, businessName], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }
    res.json({ success: true, message: 'Package deleted successfully' });
  });
});

// Add this new endpoint to your existing Node.js server code
app.get('/api/bookings1', (req, res) => {
  // Ensure the user is authenticated and is a business
  if (req.session && req.session.username /*&& req.session.role === 'Business'*/) {
    const businessName = req.session.username;
    const query = 'SELECT * FROM bookings WHERE business_name = ?';
    connection.query(query, [businessName], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
        return;
      }
      res.json({ success: true, data: results });
    });
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized access' });
  }
});

// ... rest of the Node.js code ...

// Endpoint to get average rating for a package
app.get('/api/package/rating/:id', (req, res) => {
  const { id } = req.params;
  // Ensure the query is selecting where package_id matches the id exactly
  const query = 'SELECT AVG(rating) as averageRating FROM reviews WHERE package_id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }
    // Check if results[0] exists and has a property 'averageRating'
    if (results[0] && results[0].hasOwnProperty('averageRating')) {
      res.json({ success: true, averageRating: results[0].averageRating || 0 });
    } else {
      res.json({ success: false, message: 'No ratings found' });
    }
  });
});


// ... rest of the Node.js code ...



// Endpoint to get reviews for a package
app.get('/api/package/reviews/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT rating, review FROM reviews WHERE package_id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }
    res.json(results);
  });
});

// Endpoint to submit a review for a package
app.post('/api/package/review', (req, res) => {
  const { package_id, user_id, rating, review } = req.body;
  const query = 'INSERT INTO reviews (package_id, user_id, rating, review) VALUES (?, ?, ?, ?)';
  connection.query(query, [package_id, user_id, rating, review], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }
    res.json({ success: true, message: 'Review submitted successfully' });
  });
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
