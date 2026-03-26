import nodemailer from 'nodemailer';

const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email environment variables are not fully set');
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};
