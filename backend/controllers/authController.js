import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const OTP_SECRET = process.env.OTP_SECRET || 'otp_secret_key';

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
