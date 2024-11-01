const User = require('../models/Users')
const Token = require('../models/Token')

const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require('../utils')
const crypto = require('crypto')

const register = async (req, res) => {
  const { name, email, password } = req.body

  const emailAlreadyExists = await User.findOne({ email })

  //make first registered user admin
  const isFirstAccount = (await User.countDocuments({})) === 0
  const role = isFirstAccount ? 'admin' : 'user'

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('The email is already in use.')
  }

  const verificationToken = crypto.randomBytes(40).toString('hex')

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  })

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin: 'http://localhost:3000',
  })

  res.status(StatusCodes.CREATED).json({
    msg: 'Success, user has been created.',
  })
}

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    throw new CustomError.NotFoundError('User not found')
  }

  if (verificationToken === user.tokenVerification) {
    throw new CustomError.BadRequestError(
      'The verification token does not match'
    )
  }

  user.isVerified = true
  user.verified = Date.now()
  user.verificationToken = ''

  await user.save()

  res.status(200).json({ msg: 'Email is verified' })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new CustomError.BadRequestError('Enter an email and a password')
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new CustomError.UnauthenticatedError('User not found')
  }

  const isPasswordCorrect = await user.comparePassword(password)

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('password does not match')
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email')
  }

  const tokenUser = createTokenUser(user)

  // Create refresh token
  let refreshToken = ''

  // Check if token exists
  const existingToken = await Token.findOne({ user: user._id })

  if (existingToken) {
    const { isValid } = existingToken
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('User cannot access this site')
    }
    refreshToken = existingToken.refreshToken
    attachCookiesToResponse({ res, user: tokenUser, refreshToken })
    res.status(StatusCodes.OK).json({ user: tokenUser })
    return
  }

  refreshToken = crypto.randomBytes(40).toString('hex')
  const ip = req.ip
  const userAgent = req.headers['user-agent']
  const userToken = { refreshToken, ip, userAgent, user: user._id }

  await Token.create(userToken)

  attachCookiesToResponse({ res, user: tokenUser, refreshToken })

  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId })

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })

  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })

  res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}

const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new CustomError.BadRequestError('Provide valid email')
  }

  const user = await User.findOne({ email })

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex')

    // Send Email
    const origin = 'http://localhost:3000'
    sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    })

    tenMinutes = 1000 * 60 * 10
    const passwordTokenExpiry = new Date(Date.now() + tenMinutes)

    user.passwordToken = createHash(passwordToken)
    user.passwordTokenExpiry = passwordTokenExpiry

    await user.save()
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Check email for password reset link' })
}

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body

  if ((!token, !email, !password)) {
    throw new CustomError.BadRequestError('Provide all values')
  }

  const user = await User.findOne({ email })

  if (user) {
    const currentDate = new Date.now()
    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpiry > currentDate
    ) {
      user.password = password
      user.passwordToken = null
      user.passwordTokenExpiry = null

      await user.save()
    }
  }
  res.send('reset password')
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
}
