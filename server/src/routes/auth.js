const express = require('express');
const rateLimit = require('express-rate-limit');
const Otp = require('../models/Otp');
const { generateOtp, hashOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../lib/mailer');

const router = express.Router();

const requestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: (req) => (req.body && req.body.email ? req.body.email : req.ip)
});

router.post('/request-otp', requestLimiter, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Email is required' });

    const otp = generateOtp(6);
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email },
      { otpHash, expiresAt, attempts: 0, lockedUntil: null },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otp);

    return res.json({ message: 'OTP sent' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const doc = await Otp.findOne({ email });
    if (!doc) return res.status(400).json({ message: 'Invalid or expired OTP' });

    if (doc.lockedUntil && doc.lockedUntil > new Date()) return res.status(429).json({ message: 'Too many attempts. Try later.' });

    if (doc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: doc._id });
      return res.status(400).json({ message: 'OTP expired' });
    }

    const inputHash = hashOtp(String(otp));
    const isMatch = inputHash === doc.otpHash;

    if (!isMatch) {
      const attempts = (doc.attempts || 0) + 1;
      const update = { attempts };
      if (attempts >= 5) update.lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      await Otp.updateOne({ _id: doc._id }, update);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await Otp.deleteOne({ _id: doc._id });
    return res.json({ message: 'OTP verified' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
