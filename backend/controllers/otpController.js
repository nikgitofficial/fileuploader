import OtpToken from '../models/Otp.js';
import { sendOtpEmail } from '../utils/mailer.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const OTP_SECRET = process.env.OTP_SECRET || 'otp_secret_key';

// Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // ✅ Generate OTP and expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // ✅ Save or update OTP in database
  await OtpToken.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  // ✅ Send email
  await sendOtpEmail(email, otp);
  res.status(200).json({ message: 'OTP sent successfully' });
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  const record = await OtpToken.findOne({ email });
  if (!record || record.otp !== otp || record.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // ✅ Generate JWT token (instead of a random hex string)
  const otpToken = jwt.sign({ email }, OTP_SECRET, { expiresIn: '10m' });

  // ✅ Update DB to invalidate the numeric OTP
  await OtpToken.findOneAndUpdate(
    { email },
    { otp: null, expiresAt: new Date() } // optionally clear OTP
  );

  res.status(200).json({ otpToken });
};
