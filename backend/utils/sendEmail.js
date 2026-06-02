import process from "node:process"
import nodemailer from "nodemailer"

const sendEmail = async function(options) {
  const transporter = nodemailer.createTransport({
    host:   "smtp-relay.brevo.com",
    port:   587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  })

  const mailOptions = {
    from:    '"Shopalotghana" <' + process.env.BREVO_USER + ">",
    to:      options.to,
    subject: options.subject,
    html:    options.html,
  }

  const info = await transporter.sendMail(mailOptions)
  console.log("Email sent:", info.messageId)
  return info
}

export default sendEmail