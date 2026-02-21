const https = require('https');

const buildEmailPayload = (options, senderName, senderEmail) => {
  return JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.message,
  });
};

const sendBrevoPostRequest = (payload, apiKey) => {
  const requestOptions = {
    hostname: 'api.brevo.com',
    path: '/v3/smtp/email',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': apiKey,
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(requestOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = JSON.parse(body);
          resolve(data.messageId);
        } else {
          reject(new Error(`Brevo API Error: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(payload);
    req.end();
  });
};

const sendEmail = async (options) => {
  if (process.env.NODE_ENV === 'development' && !process.env.BREVO_API_KEY) {
    console.log('--- EMAIL SIMULATION ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('------------------------');
    return;
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY is missing in environment variables.');
  }

  const senderName = process.env.FROM_NAME || 'DocSign';
  const senderEmail = process.env.FROM_EMAIL || 'noreply@docsign.com';

  const payload = buildEmailPayload(options, senderName, senderEmail);

  try {
    const messageId = await sendBrevoPostRequest(payload, brevoApiKey);
    console.log('Email sent successfully via Brevo API, messageId:', messageId);
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw new Error('Email service unavailable');
  }
};

module.exports = sendEmail;
