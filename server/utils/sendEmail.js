import nodemailer from 'nodemailer';

const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  const looksLikePlaceholder = (value = '') => {
    const v = String(value).toLowerCase();
    return (
      v.includes('your_email') ||
      v.includes('your_app_password') ||
      v.includes('example.com')
    );
  };

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email environment variables are not fully set');
  }

  if (looksLikePlaceholder(EMAIL_USER) || looksLikePlaceholder(EMAIL_PASS)) {
    throw new Error(
      'Email credentials are placeholders. Set real EMAIL_USER and EMAIL_PASS (Gmail App Password) in server/.env'
    );
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
