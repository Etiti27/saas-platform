import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL,
  NODE_ENV = 'development',
} = process.env;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,      // e.g. smtp.gmail.com / smtp.office365.com / smtp.mailgun.org / smtp.sendgrid.net
    port: Number(SMTP_PORT), // 465 or 587
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: FROM_EMAIL,    // see provider specifics below
      pass: SMTP_PASS,
    },
  });

export async function verifyMailer() {
  try {
    await transporter.verify();
    console.log('SMTP ready');
  } catch (e) {
    console.error('SMTP verify failed:', e.message);
    throw e;
  }
}

/**
 * Send an email
 * @param {Object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 * @param {Array}  [opts.attachments] e.g. [{ filename, path|content, contentType }]
 * @param {string|string[]} [opts.cc]
 * @param {string|string[]} [opts.bcc]
 */
export async function sendMail(opts) {
    try{
    const { to, subject, html, from } = opts;

    if (!to) throw new Error('sendMail: "to" is required');
    if (!subject) throw new Error('sendMail: "subject" is required');
    if (!html && !text) throw new Error('sendMail: "html" or "text" is required');


  const mailOptions = {
    from: from,
    to: to,
    // cc: opts.cc,
    // bcc: opts.bcc,
    subject: subject,
    // text: opts.text,
    html: html,
    // attachments: opts.attachments,
  };

  // In dev, log instead of sending (optional)
  if (NODE_ENV === 'development' && !SMTP_HOST) {
    console.log('DEV mail (not sent):', mailOptions);
    return { messageId: 'dev-preview', previewURL: null };
  }

  const info = await transporter.sendMail(mailOptions);
  // If using Ethereal, you can preview at nodemailer.getTestMessageUrl(info)
  return info;
}catch(e){
    console.log(e.message);
    throw e.message
}
}
