import * as nodemailer from 'nodemailer';

let transporter = createTransport();

export async function getTransporter() {
  return transporter;
}

async function createTransport() {
  try {
    return nodemailer.createTransport('localhost');
  } catch {
    const acc = await nodemailer.createTestAccount();
    console.log(acc.web, acc.user, acc.pass);
    return nodemailer.createTransport({
      host: acc.smtp.host,
      port: acc.smtp.port,
      secure: acc.smtp.secure,
      auth: { user: acc.user, pass: acc.pass },
    });
  }
}
