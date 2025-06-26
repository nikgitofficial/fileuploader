import express from 'express';
import { login, register } from '../controllers/authController.js';
import { sendOtp, verifyOtp, sendResetOtp,verifyResetOtp,resetPassword } from '../controllers/otpController.js';
const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/send-reset-otp', sendResetOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);



router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
