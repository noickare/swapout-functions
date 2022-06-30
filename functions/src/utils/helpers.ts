/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import * as nodemailer from "nodemailer";
import {NewMessageHtml} from "../templates/newMessageEMail";

export function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + " [...]";
  } else {
    return str;
  }
}


export async function sendEmail(dest: string, subject: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "automated@clueswap.com",
      pass: "kmvhtwtpsvbkpahi",
    },
  });


  const mailOptions = {
    from: "Clueswap Automated <automated@clueswap.com>", // Something like: Jane Doe <janedoe@gmail.com>
    to: dest,
    subject: subject, // email subject
    html: NewMessageHtml,
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw new Error(error.message);
    }
    return info;
  });
}
