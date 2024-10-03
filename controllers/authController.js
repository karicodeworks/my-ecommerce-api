const User = require('../models/Users')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
  const { name, email, password } = req.body

  const emailAlreadyExists = await User.findOne({ email })

  //make first registered user admin
  const isFirstAccount = (await User.countDocuments({})) === 0

  const role = isFirstAccount ? 'admin' : 'user'

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('The email is already in use.')
  }

  const user = await User.create({ name, email, password, role })

  tokenUser = { name: user.name, userId: user._id, role: user.role }
  token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })

  res.status(StatusCodes.CREATED).json({ user: tokenUser, token })
}

const login = async (req, res) => {
  res.send('This is login')
}

const logout = async (req, res) => {
  res.send('This is logout')
}

module.exports = {
  register,
  login,
  logout,
}
