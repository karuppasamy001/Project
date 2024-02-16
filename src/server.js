const express = require('express');
const nodemailer = require('nodemailer');
const session = require('express-session'); // Add this line
const app = express();
const cors = require('cors');

// Middleware to parse JSON body
app.use(express.json());

//Session middleware
app.use(session({
  secret: 'your_secret_key', // Change this to a secure random key
  resave: false,
  saveUninitialized: true
}));

const corsOptions = {
  origin: 'http://localhost:4200'
};

app.use(cors(corsOptions));

// Route to send OTP
app.post('/send-otp', (req, res) => {
  const { email, otp } = req.body;
  req.session.otp = otp; // Store OTP in session

  // Send OTP to email
  sendOTP(email, otp)
    .then(() => {
      res.status(200).json({ message: 'OTP sent successfully' });
    })
    .catch(error => {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Error sending OTP' });
    });
});

// Route to verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  // Check if req.session exists and contains otp property
  if (req.session && req.session.otp && otp === req.session.otp) {
    // OTP verified successfully
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

// Route to send username and password
app.post('/send-credentials', (req, res) => {
  const { email, username, password } = req.body;

  // Send username and password to email
  sendCredentials(email, username, password)
    .then(() => {
      res.status(200).json({ message: 'Username and password sent successfully' });
    })
    .catch(error => {
      console.error('Error sending credentials:', error);
      res.status(500).json({ error: 'Error sending credentials' });
    });
});

// Function to send OTP to email
function sendOTP(email, otp) {
  // Nodemailer configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tce.mca.2022@gmail.com',
      pass: 'vzlx rqug imhw dlnb',
    },
  });

  // Email message options
  const mailOptions = {
    from: 'tce.mca.2024@gmail.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is: ${otp}`,
  };

  console.log("Sending OTP...");

  // Send email with OTP
  return transporter.sendMail(mailOptions);
}

// Function to generate OTP


// Function to send username and password to email
function sendCredentials(email, username, password) {
  // Implement logic to send username and password to email here
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tce.mca.2022@gmail.com',
      pass: 'vzlx rqug imhw dlnb',
    },
  });

  // Email message options
  const mailOptions = {
    from: 'tce.mca.2024@gmail.com',
    to: email,
    subject: 'UserName and Password for TCE Login',
    text: `Your Username : ${username} and Your password : ${password}`,
    
  };

  console.log("sends username and password");

  // Send email with OTP
  return transporter.sendMail(mailOptions);
  
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
