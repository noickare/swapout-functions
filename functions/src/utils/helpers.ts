/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import * as nodemailer from "nodemailer";
import * as fs from "fs";
import {promisify} from "util";

export function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + " [...]";
  } else {
    return str;
  }
}


export async function sendEmail(dest: string, subject: string) {
  const readFile = promisify(fs.readFile);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "automated@clueswap.com",
      pass: "nzs@@yfhS$V@3m",
    },
  });

  const mailOptions = {
    from: "Clueswap Automated <automated@clueswap.com>", // Something like: Jane Doe <janedoe@gmail.com>
    to: dest,
    subject: subject, // email subject
    html: await readFile("../templates/newMessage.html", "utf8"),
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw new Error(error.message);
    }
    return info;
  });
}
