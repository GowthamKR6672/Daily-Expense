const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(`Attempting to send email to: ${options.email} via Brevo SMTP`);
  console.log(`Config: User=${process.env.EMAIL_USER}, From=${process.env.EMAIL_FROM}`);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 465,
    secure: true, // Use SSL/TLS (required for port 465)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 15000,
    socketTimeout: 15000
  });

  const mailOptions = {
    from: `"HB Money" <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('SMTP Error details:', error);
    throw error;
  }
};

module.exports = sendEmail;
