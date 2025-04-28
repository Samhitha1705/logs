const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const winston = require('winston');  // Add winston
 
const app = express();
const PORT = 3000;
 
const SPLUNK_HEC_TOKEN = 'a9ed4099-da76-46b0-beff-d2d484e98188';
const SPLUNK_HEC_URL = 'https://localhost:8088/services/collector/event';
 
// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    // Console log
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File log
    new winston.transports.File({ filename: 'login.log' }),
  ],
});
 
app.use(bodyParser.urlencoded({ extended: true }));
 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
 
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const timestamp = new Date().toISOString();
 
  const logMessage = `${timestamp} - Login attempt by user: ${username}`;
 
  // ✅ Log to Winston (both console and file)
  logger.info(logMessage);  // logs to console and file
 
  // ✅ Log to Splunk
  await axios.post(SPLUNK_HEC_URL, {
    event: {
      type: 'login_attempt',
      username: username,
      status: 'received',
      timestamp: timestamp,
    },
  }, {
    headers: {
      'Authorization': `Splunk ${SPLUNK_HEC_TOKEN}`,
    },
  }).catch(err => {
    console.error('Error logging to Splunk:', err.message);
  });
 
  res.send(`Login received for user: ${username}`);
});
 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 