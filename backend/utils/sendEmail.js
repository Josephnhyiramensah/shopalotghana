import nodemailer from "nodemailer"
import process from "node:process"

const sendEmail = async function({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  console.log("Sending email to:", to)
  console.log("Using Gmail:", process.env.EMAIL_USER)

  const mailOptions = {
    from: '"Shopalotghana" <' + process.env.EMAIL_USER + '>',
    to: to,
    subject: subject,
    html: html,
  }

  await transporter.sendMail(mailOptions)
  console.log("Email sent successfully!")
}

export default sendEmail

