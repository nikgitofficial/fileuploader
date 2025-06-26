export const sendOtpEmail = async (email, otp) => {
  const subject = 'Your Password Reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>Use the following One-Time Password (OTP) to reset your password. It will expire in 10 minutes.</p>
      <h3 style="color: #2c3e50;">${otp}</h3>
      <p>If you did not request a reset, please ignore this email.</p>
      <hr />
      <small>This is an automated message. Do not reply.</small>
    </div>
  `;

  await transporter.sendMail({
    to: email,
    subject,
    html
  });
};
