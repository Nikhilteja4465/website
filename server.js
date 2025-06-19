require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const querystring = require('querystring');

const PORT = 3000;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '181fa04465@gmail.com',
    pass: 'lyub feih novv hdst',
  },
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    let filePath = '';
    if (req.url === '/') {
      filePath = path.join(__dirname, 'public/index.html');
    } else {
      filePath = path.join(__dirname, req.url);
    }

    // Serve static files
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
        return;
      }

      // Set MIME types for common static files
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.pdf': 'application/pdf',
        '.ico': 'image/x-icon',
      };

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  } else if (req.method === 'POST' && req.url === '/send') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const formData = querystring.parse(body);
      const { name, email, message } = formData;

      const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `Contact form submission from ${name}`,
        text: message,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error:', error);  
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to send email');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Email sent successfully');
      });
    });
  } else if (req.method === 'OPTIONS') {
    // For CORS preflight requests
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
