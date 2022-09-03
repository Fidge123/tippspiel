import { ServerClient } from 'postmark';
import { env } from 'process';

const transporter = createTransport();

export async function getTransporter() {
  return transporter;
}

async function createTransport() {
  try {
    if (env.POSTMARK) {
      return new ServerClient(env.POSTMARK);
    } else {
      return {
        sendEmail() {
          return Promise.reject('No Postmark token was set');
        },
      };
    }
  } catch (error) {
    console.log(error);
  }
}
