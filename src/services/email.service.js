import { google } from 'googleapis';
import { config } from '../config/config.js';

const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: config.REFRESH_TOKEN,
});

// Verify the connection on startup
try {
  const { token } = await oauth2Client.getAccessToken();
  if (token) {
    console.log('Email server is ready to send messages');
  }
} catch (error) {
  console.error('Error connecting to email server:', error.message);
}

export const sendMail = async (email, subject, html) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const message = [
      `To: ${email}`,
      `From: ${config.EMAIL_USER}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    console.log('Email sent successfully:', res.data.id);
    return res.data;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};
