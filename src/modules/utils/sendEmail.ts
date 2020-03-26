import nodemailer from "nodemailer";
import { appPassword } from "./picbyEmailPass";

interface SendEmailArgs {
  email: string;
  url: string;
}

export async function sendEmail({ email, url }: SendEmailArgs) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      //contact Marcin for password
      user: "picbyapp@gmail.com",
      pass: appPassword
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  let HelperOptions = {
    from: '"Marcin" <picbyapp@gmail.com',
    to: email,
    subject: "Potwierdź swoje konto Picby",
    html: `Aby potwierdzić swoje konto kliknij w link używając urządzenia mobilnego: <a href="${url}">${url}</a>`
  };

  transporter.sendMail(HelperOptions, (error: any, info: any) => {
    if (error) {
      console.log(error);
      throw new Error();
    }
    console.log("The message was sent to `email`!");
    console.log(info);
  });
}
