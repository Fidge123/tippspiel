import { ServerClient } from 'postmark';
import { env } from 'process';

const transporter = createTransport();

export async function getTransporter() {
  return transporter;
}

async function createTransport() {
  try {
    return new ServerClient(env.POSTMARK);
  } catch (error) {
    console.log(error);
  }
}
