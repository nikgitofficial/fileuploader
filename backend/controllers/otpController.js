import OtpToken from '../models/Otp.js';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const OTP_SECRET = process.env.OTP_SECRET || 'otp_secret_key';

// ✅ Send OTP for forgot password or registration
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const existing = await OtpToken.findOne({ email });

  if (existing?.lockUntil && existing.lockUntil > new Date()) {
    const seconds = Math.ceil((existing.lockUntil - new Date()) / 1000);
    return res.status(429).json({
      error: `Too many attempts. Try again in ${seconds} seconds.`,
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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

  await sendOtpEmail(email, otp);
  res.status(200).json({ message: 'OTP sent successfully' });
};

// ✅ Verify OTP and return short-lived token
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  const record = await OtpToken.findOne({ email });
  if (!record) return res.status(400).json({ error: 'No OTP found for this email' });

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

  const otpToken = jwt.sign({ email }, OTP_SECRET, { expiresIn: '10m' });

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

// ✅ Reset password using verified OTP token
export const resetPassword = async (req, res) => {
  const { email, password, otpToken } = req.body;
  try {
    const decoded = jwt.verify(otpToken, OTP_SECRET);
    if (decoded.email !== email) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    await OtpToken.deleteOne({ email });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
