import nodeoutlook from "nodejs-nodemailer-outlook";

export function sendEmail(dest, subject, message) {
  nodeoutlook.sendEmail({
    auth: {
      user: process.env.SenderEmail,
      pass: process.env.SenderPassword,
    },
    from: process.env.SenderEmail,
    to: dest,
    subject,
    html: message,

    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i),
  });
}