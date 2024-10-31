const sendEmail = require('./sendEmail')

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`

  const message = `<p>Click on the following link to verify you email: <a href="${verifyEmail}">Verify Email</a></p>`

  sendEmail({
    to: email,
    subject: 'Verification Email',
    html: `<h1>Hello, ${name}</h1>${message}`,
  })
}

module.exports = sendVerificationEmail
