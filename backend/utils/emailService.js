const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log('SMTP Server connection established');
  } catch (error) {
    console.error('SMTP Connection Error:', error);
    // If no credentials are setup, we might want to just log the email in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('--- EMAIL SIMULATION ---');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}`);
      console.log('------------------------');
      return;
    }
    throw new Error('Email service unavailable');
  }

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || `${process.env.FROM_NAME || 'DocSign'} <${process.env.FROM_EMAIL || 'noreply@docsign.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;

