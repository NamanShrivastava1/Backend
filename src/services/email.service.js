import nodemailer from 'nodemailer';

import { config } from '../config/config.js';

console.log('ENV CHECK:');
console.log('EMAIL_USER:', config.EMAIL_USER);
console.log('CLIENT_ID:', config.GOOGLE_CLIENT_ID?.slice(0, 10));
console.log('REFRESH_TOKEN:', config.REFRESH_TOKEN?.slice(0, 10));
console.log('Secret:', config.GOOGLE_CLIENT_SECRET?.slice(0, 10));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: config.EMAIL_USER,
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    refreshToken: config.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export const sendMail = async (email, subject, html) => {
  try {
    const mailOptions = {
      from: config.EMAIL_USER,
      to: email,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default transporter;
