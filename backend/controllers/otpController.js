import OtpToken from '../models/Otp.js';
import { sendOtpEmail } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';

const OTP_SECRET = process.env.OTP_SECRET || 'otp_secret_key';

// Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const existing = await OtpToken.findOne({ email });

  // Check lock
  if (existing?.lockUntil && existing.lockUntil > new Date()) {
    const seconds = Math.ceil((existing.lockUntil - new Date()) / 1000);
    return res.status(429).json({
      error: `Too many attempts. Try again in ${seconds} seconds.`,
    });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save/update OTP
  await OtpToken.findOneAndUpdate(
    { email },
    {
      otp,
      expiresAt,
      attempts: 0,
      lockUntil: null,
    },
    { upsert: true, new: true }
  );

  // Send Email
  await sendOtpEmail(email, otp);
  res.status(200).json({ message: 'OTP sent successfully' });
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  const record = await OtpToken.findOne({ email });
  if (!record) return res.status(400).json({ error: 'No OTP found for this email' });

  // Check lock
  if (record.lockUntil && record.lockUntil > new Date()) {
    const seconds = Math.ceil((record.lockUntil - new Date()) / 1000);
    return res.status(429).json({
      error: `Account temporarily locked. Try again in ${seconds} seconds.`,
    });
  }

  const isExpired = record.expiresAt < new Date();
  const isIncorrect = record.otp !== otp;

  if (isExpired || isIncorrect) {
    const newAttempts = (record.attempts || 0) + 1;
    const isLocked = newAttempts >= 3;
    const lockUntil = isLocked ? new Date(Date.now() + 5 * 60 * 1000) : null;

    await OtpToken.findOneAndUpdate(
      { email },
      {
        attempts: newAttempts,
        lockUntil,
      }
    );

    return res.status(400).json({
      error: isLocked
        ? 'Too many failed attempts. Try again in 5 minutes.'
        : `Invalid OTP. You have ${3 - newAttempts} attempt(s) left.`,
    });
  }

  // Success: generate token
  const otpToken = jwt.sign({ email }, OTP_SECRET, { expiresIn: '10m' });

  // Clear OTP from DB
  await OtpToken.findOneAndUpdate(
    { email },
    {
      otp: null,
      expiresAt: new Date(),
      attempts: 0,
      lockUntil: null,
    }
  );

  res.status(200).json({ otpToken });
};
