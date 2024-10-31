const User = require('../models/Users')
const Token = require('../models/Token')

const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
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
  const existingToken = await Token.findOne({ user: user_id })

  if (existingToken) {
    const { isValid } = existingToken
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('User cannot access this site')
    }
    refreshToken = existingToken.refreshToken
    attachCookiesToResponse({ res, user: tokenUser, refreshToken })
    res.status(StatusCodes.OK).json({ user: tokenUser, token })
    return
  }

  refreshToken = crypto.randomBytes(40).toString('hex')
  const ip = req.ip
  const userAgent = req.headers['user-agent']
  const userToken = { refreshToken, ip, userAgent, user: user._id }

  const token = await Token.create(userToken)

  attachCookiesToResponse({ res, user: tokenUser, refreshToken })

  res.status(StatusCodes.OK).json({ user: tokenUser, token })
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

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
}
