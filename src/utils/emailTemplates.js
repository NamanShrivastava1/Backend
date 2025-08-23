const otpVerificationTemplate = (userName, otp) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color:#ff6600;">Welcome to ScanDine, ${userName} 👋</h2>
      <p>We’re excited to have you onboard! To complete your registration, please use the OTP below:</p>
      <div style="background:#f4f4f4; padding:10px; border-radius:8px; width:fit-content; margin:20px auto;">
        <h1 style="letter-spacing:4px; color:#333;">${otp}</h1>
      </div>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <br>
      <p style="color:#666;">🍽️ The ScanDine Team</p>
    </div>
  `;
};

// Reset Password
const resetPasswordTemplate = (userName, link) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color:#ff6600;">Hello ${userName},</h2>
      <p>You requested to reset your password for your ScanDine account.</p>
      <p>Click the button below to reset it:</p>
      <a href="${link}" target="_blank"
        style="display:inline-block; background:#ff6600; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; margin:20px 0;">
        Reset Password
      </a>
      <p>If you didn’t request this, please ignore this email.</p>
      <br>
      <p style="color:#666;">🍽️ The ScanDine Team</p>
    </div>
  `;
};

// Cafe Created Confirmation
const cafeCreatedTemplate = (userName, cafeName) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color:#ff6600;">Hi ${userName},</h2>
      <p>Your cafe <b>${cafeName}</b> has been successfully created on ScanDine! 🎉</p>
      <p>You can now add menu items and share your cafe’s QR code with customers.</p>
      <br>
      <p style="color:#666;">🍽️ The ScanDine Team</p>
    </div>
  `;
};

module.exports = {
    otpVerificationTemplate,
    resetPasswordTemplate,
    cafeCreatedTemplate
};