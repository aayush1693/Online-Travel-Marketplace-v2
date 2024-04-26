const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const mysql = require('mysql');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'travel_marketplace'
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // appending extension
  }
});

let upload = multer({ 
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/browse_packages.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'browse_packages.html'));
});

app.get('/browse_packages.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'browse_packages.js'));
});

app.post('/api/services', upload.single('image'), (req, res) => {
  const service = req.body;
  const image = req.file;

  if (!image) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  // Insert the service data into the database
  const query = 'INSERT INTO services (name, description, price, date, time, image) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [service.name, service.description, service.price, service.date, service.time, image.filename];

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }

    res.json({ success: true, data: service, file: image });
  });
});

// Fetch packages
app.get('/api/packages', (req, res) => {
  const query = 'SELECT * FROM packages';
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }

    res.json({ success: true, data: results });
  });
});

// Submit review
app.post('/api/reviews', (req, res) => {
  const review = req.body;
  const query = 'INSERT INTO reviews (package_id, rating, review) VALUES (?, ?, ?)';
  const params = [review.package_id, review.rating, review.review];

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Database error' });
      return;
    }

    res.json({ success: true, data: review });
  });
});



app.post('/api/bookings', (req, res) => {
    const booking = req.body;

    // Insert the booking data into the database
    const query = 'INSERT INTO bookings (name, email, package_id) VALUES (?, ?, ?)';
    const params = [booking.name, booking.email, booking.package];

    pool.query(query, params, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }

        // Send the receipt email to the user
        let transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
              user: 'parajuli.aayush@outlook.com',
              pass: 'Aayush24'
            }
          });

        let mailOptions = {
            from: 'your-email@gmail.com',
            to: booking.email,
            subject: 'Booking Receipt',
            html: `
                <h1 style="color: #444;">Thank you for booking a package, ${booking.name}!</h1>
                <p style="color: #666;">We have received your booking for package ID: ${booking.package}.</p>
                <p style="color: #666;">A confirmation email has been sent to your email address: ${booking.email}.</p>
                <p style="color: #666;">If you have any questions, please reply to this email.</p>
                <p style="color: #999;">Best regards,</p>
                <p style="color: #999;">The Travel Marketplace Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Email error' });
                return;
            }

            // Send the booking confirmation email to the business provider
            let providerMailOptions = {
                from: 'your-email@gmail.com',
                to: 'provider-email@gmail.com', // replace with the business provider's email
                subject: 'New Booking',
                html: `
                    <h1 style="color: #444;">New Booking Received</h1>
                    <p style="color: #666;">A new booking has been made by ${booking.name} for package ID: ${booking.package}.</p>
                    <p style="color: #666;">The user's email address is: ${booking.email}.</p>
                    <p style="color: #999;">Best regards,</p>
                    <p style="color: #999;">The Travel Marketplace Team</p>
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
    });
});

app.listen(3000, () => console.log('Server started on port 3000'));