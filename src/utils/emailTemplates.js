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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; background-color: #f9f9f9; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #eee; padding: 32px;">
        
        <h2 style="color: #ff6600; margin-bottom: 16px;">Welcome to ScanDine, ${userName}!</h2>
        
        <p style="font-size: 16px; margin-bottom: 12px;">
          We’re excited to let you know that your café <strong>${cafeName}</strong> has been successfully created on <b>ScanDine</b> 🎉
        </p>
        
        <p style="font-size: 15px; margin-bottom: 12px;">
          You can now:
        </p>
        <ul style="font-size: 15px; padding-left: 20px; margin-top: 4px; margin-bottom: 16px;">
          <li>Add and customize menu items effortlessly</li>
          <li>Generate and share your unique QR code with customers</li>
          <li>Manage orders smoothly through your dashboard</li>
        </ul>
        
        <p style="margin-bottom: 20px; font-size: 15px;">
          To get started, log in to your dashboard and begin setting up your menu.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://scan-dine.vercel.app/dashboard" target="_blank"
             style="background-color: #ff6600; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 15px;">
             Go to Dashboard
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666; text-align: center;">
          🍽️ Happy Serving! – The ScanDine Team
        </p>
      </div>
    </div>
  `;
};


module.exports = {
  otpVerificationTemplate,
  resetPasswordTemplate,
  cafeCreatedTemplate
};