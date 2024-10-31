const User = require('../models/Users')
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
    throw new CustomError.UnauthenticatedError('Please verify you email')
  }

  const tokenUser = createTokenUser(user)

  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
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
