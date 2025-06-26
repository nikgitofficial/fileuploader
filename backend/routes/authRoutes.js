import express from 'express';
import {
  login,
  register,
  resetPassword,sendResetOtp,verifyResetOtp} from '../controllers/authController.js';

import {
  sendOtp,
  verifyOtp
} from '../controllers/otpController.js';

const router = express.Router();

// ✅ Registration and login
router.post('/register', register);
router.post('/login', login);

// ✅ OTP for registration & password reset
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// ✅ Password reset using verified OTP token
router.post('/send-reset-otp', sendResetOtp); 
router.post('/verify-reset-otp', verifyResetOtp);                           
router.post('/reset-password', resetPassword);

// ✅ Logout (clear refresh token)
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
