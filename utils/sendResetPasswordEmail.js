const sendEmail = require('./sendEmail')

const sendResetPasswordEmail = async (name, email, token, origin) => {
  const resetURL = `${origin}user/reset-password?token=${token}&email=${email}`
  const message = `<p>Click on the following link to reser password</p>
    <a href=${resetURL}>Reset Password</a>`

  return sendEmail({
    to: email,
    subject: 'Reset Password',
    html: `Hello, ${name}
    ${message}`,
  })
}

module.exports = sendResetPasswordEmail
