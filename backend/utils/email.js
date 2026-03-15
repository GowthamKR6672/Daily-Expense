const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(`Attempting to send email to: ${options.email} via Brevo SMTP`);
  console.log(`Config: User=${process.env.EMAIL_USER}, From=${process.env.EMAIL_FROM}`);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
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
