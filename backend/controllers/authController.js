import User from '../models/User.js';
import OtpToken from '../models/Otp.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const OTP_SECRET = process.env.OTP_SECRET || 'otp_secret_key';
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_key';

// ✅ Register with OTP token verification
export const register = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password, otpToken } = req.body;

    if (!email || !password || !otpToken) {
      return res.status(400).json({ error: 'Email, password, and OTP token are required' });
    }

    // ✅ Verify OTP token
    let decoded;
    try {
      decoded = jwt.verify(otpToken, OTP_SECRET);
      if (decoded.email !== email) {
        return res.status(400).json({ error: 'OTP token does not match email' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired OTP token' });
    }

    // ✅ Check for existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: 'user'
    });

    // ✅ Issue login token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
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
      JWT_SECRET,
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
