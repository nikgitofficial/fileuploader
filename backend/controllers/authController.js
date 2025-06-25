import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const OTP_SECRET = process.env.OTP_SECRET || 'otp_secret_key';
const OTP_EXPIRES_IN = '10m'; // 10 minutes

// 🚀 Send OTP via Gmail
export const sendOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const otpToken = jwt.sign({ email }, OTP_SECRET, { expiresIn: OTP_EXPIRES_IN });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.OTP_EMAIL,
        pass: process.env.OTP_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.OTP_EMAIL,
      to: email,
      subject: 'Your OTP for Registration',
      html: `
        <div style="font-family: sans-serif;">
          <h2>🔐 Email Verification</h2>
          <p>Please use the token below to verify your email for registration:</p>
          <pre style="font-size: 16px; background: #f4f4f4; padding: 8px; border-radius: 4px;">
${otpToken}
          </pre>
          <p>This token expires in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions).catch((err) => {
      console.error('❌ Email send failed:', err);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    });

    console.log(`📧 OTP sent to ${email}`);
    res.status(200).json({ message: 'OTP sent successfully' /* , otpToken */ });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
};

// ✅ Register with OTP token verification
export const register = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password, otpToken } = req.body;

    if (!email || !password || !otpToken) {
      return res.status(400).json({ error: 'Email, password, and OTP token are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(otpToken, OTP_SECRET);
      if (decoded.email !== email) {
        return res.status(400).json({ error: 'OTP token does not match email' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired OTP token' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: 'user'
    });

    // Optional: issue login token after register
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'User registered successfully', token });

  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Login handler
export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
