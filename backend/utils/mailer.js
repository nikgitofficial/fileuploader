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
    html: '';
  };

  await transporter.sendMail(mailOptions);
};
