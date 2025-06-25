import OtpToken from '../models/Otp.js';
import { sendOtpEmail } from '../utils/mailer.js';
import crypto from 'crypto';

// Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
//
  const existingOtp = await OtpToken.findOne({ email });
  if (existingOtp && existingOtp.expiresAt > new Date()) {
    return res.status(429).json({ error: 'Please wait before requesting another OTP.' });
  }
  //

  //const otp = Math.floor(100000 + Math.random() * 900000).toString();
 // const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//await OtpToken.findOneAndUpdate(
// { email },
//{ otp, expiresAt },
  //  { upsert: true, new: true }
 // );

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

  // Generate OTP token to allow password step
  const otpToken = crypto.randomBytes(16).toString('hex');
  await OtpToken.findOneAndUpdate({ email }, { otp: otpToken, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

  res.status(200).json({ otpToken });
};
