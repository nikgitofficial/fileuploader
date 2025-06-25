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
    html: `<h2>Your OTP Code</h2><p><strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
