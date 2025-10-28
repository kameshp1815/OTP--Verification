const nodemailer = require('nodemailer');
const config = require('../config');

function createTransporter() {
  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: { user: config.mail.user, pass: config.mail.pass }
  });
}

async function sendOtpEmail(to, otp) {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: config.mail.from,
    to,
    subject: 'Your OTP Code',
    text: `Your verification code is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your verification code is <b>${otp}</b>. It expires in 5 minutes.</p>`
  });
  return info;
}

module.exports = { sendOtpEmail };
