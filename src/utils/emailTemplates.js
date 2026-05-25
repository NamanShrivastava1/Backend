// ── Registration OTP ────────────────────────────────
const otpVerificationTemplate = (userName, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; background-color: #f9f9f9; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #eee; padding: 32px;">

        <h2 style="color: #ff6600; margin-bottom: 16px;">Welcome to ScanDine, ${userName} 👋</h2>

        <p style="font-size: 16px; margin-bottom: 12px;">
          We're excited to have you onboard! To complete your registration, please use the verification code below:
        </p>

        <div style="background: #fff5eb; padding: 16px 24px; border-radius: 8px; border: 2px dashed #ff6600; text-align: center; margin: 24px auto; width: fit-content;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ff6600;">${otp}</span>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 16px;">
          This code is valid for <b>5 minutes</b>. Do not share it with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <p style="font-size: 13px; color: #999; text-align: center;">
          If you didn't create a ScanDine account, you can safely ignore this email.
        </p>

        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 24px;">
          🍽️ The ScanDine Team
        </p>
      </div>
    </div>
  `;
};

// ── Resend OTP ──────────────────────────────────────
const resendOtpTemplate = (userName, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; background-color: #f9f9f9; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #eee; padding: 32px;">

        <h2 style="color: #ff6600; margin-bottom: 16px;">New Verification Code 🔄</h2>

        <p style="font-size: 16px; margin-bottom: 12px;">
          Hi <strong>${userName}</strong>, here is your new verification code to complete your ScanDine account setup:
        </p>

        <div style="background: #fff5eb; padding: 16px 24px; border-radius: 8px; border: 2px dashed #ff6600; text-align: center; margin: 24px auto; width: fit-content;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ff6600;">${otp}</span>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 16px;">
          This code is valid for <b>5 minutes</b>. Do not share it with anyone.
        </p>

        <p style="font-size: 14px; color: #888; text-align: center; margin-bottom: 8px;">
          If your previous code expired, no worries — just use this one.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <p style="font-size: 13px; color: #999; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>

        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 24px;">
          🍽️ The ScanDine Team
        </p>
      </div>
    </div>
  `;
};

// ── Reset Password OTP ──────────────────────────────
const resetPasswordTemplate = (userName, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; background-color: #f9f9f9; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; border: 1px solid #eee; padding: 32px;">

        <h2 style="color: #ff6600; margin-bottom: 16px;">Reset Your Password 🔐</h2>

        <p style="font-size: 16px; margin-bottom: 12px;">
          Hi <strong>${userName}</strong>, we received a request to reset the password for your ScanDine account.
        </p>

        <p style="font-size: 15px; margin-bottom: 8px;">
          Use the code below to reset your password:
        </p>

        <div style="background: #fff5eb; padding: 16px 24px; border-radius: 8px; border: 2px dashed #ff6600; text-align: center; margin: 24px auto; width: fit-content;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ff6600;">${otp}</span>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 16px;">
          This code is valid for <b>5 minutes</b>. Do not share it with anyone.
        </p>

        <div style="background: #fff3cd; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="font-size: 14px; color: #856404; margin: 0;">
            ⚠️ If you did not request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 24px;">
          🍽️ The ScanDine Team
        </p>
      </div>
    </div>
  `;
};

// ── Cafe Created Confirmation ───────────────────────
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

export {
  otpVerificationTemplate,
  resendOtpTemplate,
  resetPasswordTemplate,
  cafeCreatedTemplate,
};
