const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMail = (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"ScanDine" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("❌ Error sending email:", err);
    } else {
      console.log("✅ Email sent:", info.response);
    }
  });
};
