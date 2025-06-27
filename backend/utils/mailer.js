// backend/utils/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_APP_PASSWORD,
  },
});

/**
 * Send OTP email
 * @param {string} to - recipient email
 * @param {string} otp - one-time password
 */
export const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.OTP_EMAIL,
    to,
    subject: 'Your OTP Code',
    html: `
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        max-width: 480px; 
        margin: auto; 
        padding: 20px; 
        border: 1px solid #eaeaea; 
        border-radius: 8px; 
        background-color: #f9f9f9; 
        color: #333;
      ">
        <h2 style="color: #0070f3; margin-bottom: 10px;">Your One-Time Password (OTP)</h2>
        <p style="font-size: 16px;">Use the code below to complete your verification. This code will expire in <strong>10 minutes</strong>.</p>
        <div style="
          margin: 20px 0; 
          padding: 15px 0; 
          text-align: center; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 8px; 
          color: #0070f3; 
          background-color: #e0f0ff; 
          border-radius: 6px;
          user-select: all;
        ">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #666;">
          If you did not request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Nickpacs123. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
