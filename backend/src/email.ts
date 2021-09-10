import * as nodemailer from 'nodemailer';

let transporter = createTransport();

export async function getTransporter() {
  return transporter;
}

async function createTransport() {
  try {
    return nodemailer.createTransport({
      host: 'localhost',
      port: 25,
      tls: { servername: '6v4.de' },
    });
  } catch (error) {
    console.log(error);
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