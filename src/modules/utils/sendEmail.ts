import nodemailer from "nodemailer";
import { appPassword } from "./picbyEmailPass";

interface SendEmailArgs {
  email: string;
  url: string;
  subjectIndex: number;
}

const subjects = ["Potwierdź swoje konto Picby", "Zmień swoje hasło Picby"];
const emailTextContent = [
  "Aby potwierdzić swoje konto kliknij w link używając urządzenia mobilnego:",
  "Aby zmienić hasło do swojego konta kliknij w link używając urządzenia mobilnego:"
];

export async function sendEmail({ email, url, subjectIndex }: SendEmailArgs) {
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
    from: '"Marcin" <picbyapp@gmail.com>',
    to: email,
    subject: subjects[subjectIndex],
    html: `${emailTextContent[subjectIndex]} <a href="${url}">${url}</a>`
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
