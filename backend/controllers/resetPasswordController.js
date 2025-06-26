import User from '../models/User.js';
import OtpToken from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '../utils/mailer.js';

const OTP_SECRET = process.env.OTP_SECRET || 'otp_secret_key';

// Send reset password OTP email
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'Email not registered' });

  // You can reuse your OTP generation and lock logic here:
  // Generate OTP, save in OtpToken collection, handle lockout etc.

  // Example simplified OTP creation:
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpToken.findOneAndUpdate(
    { email },
    { otp, expiresAt, attempts: 0, lockUntil: null },
    { upsert: true, new: true }
  );

  // Send OTP email:
  await sendOtpEmail(email, otp);

  res.status(200).json({ message: 'Reset OTP sent' });
};

// Verify reset password OTP
export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const record = await OtpToken.findOne({ email });
  if (!record) return res.status(400).json({ error: 'No OTP found' });

  // Check lock and expiration similar to your OTP verification logic
  if (record.lockUntil && record.lockUntil > new Date()) {
    const seconds = Math.ceil((record.lockUntil - new Date()) / 1000);
    return res.status(429).json({ error: `Too many attempts. Try again in ${seconds} seconds.` });
  }

  if (record.otp !== otp || record.expiresAt < new Date()) {
    const attempts = (record.attempts || 0) + 1;
    const lockUntil = attempts >= 3 ? new Date(Date.now() + 5 * 60 * 1000) : null;
    await OtpToken.findOneAndUpdate({ email }, { attempts, lockUntil });
    return res.status(400).json({
      error: attempts >= 3
        ? 'Too many failed attempts. Try again later.'
        : `Invalid OTP. You have ${3 - attempts} attempts left.`,
    });
  }

  // OTP valid: generate an otpToken JWT for reset authorization
  const otpToken = jwt.sign({ email }, OTP_SECRET, { expiresIn: '10m' });

  // Clear OTP so it can't be reused
  await OtpToken.findOneAndUpdate({ email }, {
    otp: null,
    expiresAt: new Date(),
    attempts: 0,
    lockUntil: null,
  });

  res.status(200).json({ otpToken });
};

// Reset password
export const resetPassword = async (req, res) => {
  const { email, password, otpToken } = req.body;
  if (!email || !password || !otpToken) {
    return res.status(400).json({ error: 'Email, password and OTP token are required' });
  }

  try {
    // Verify otpToken JWT
    const decoded = jwt.verify(otpToken, OTP_SECRET);
    if (decoded.email !== email) {
      return res.status(400).json({ error: 'Invalid OTP token' });
    }
  } catch {
    return res.status(401).json({ error: 'Invalid or expired OTP token' });
  }

  // Find user and update password
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
};
