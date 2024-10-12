const User = require('../models/Users')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils')

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password')
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`)
  }
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  const user = req.user
  res.status(StatusCodes.OK).json({ user })
}

const updateUser = async (req, res) => {
  const { name, email } = req.body

  if (!name || !email) {
    throw new CustomError.BadRequestError('Provide all the values')
  }

  const user = await User.findOne({ _id: req.user.userId })

  user.name = name
  user.email = email

  await user.save()

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Enter both passwords')
  }

  const user = await User.findOne({ _id: req.user.userId })

  const isPasswordCorrect = await user.comparePassword(oldPassword)

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('The passwords do not match')
  }

  user.password = newPassword

  await user.save()

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Password has been changed successfully.' })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}

// Updating user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { name, email } = req.body

//   if (!name || !email) {
//     throw new CustomError.BadRequestError('Give an email or password')
//   }

//   const userUpdate = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { name, email },
//     { new: true, runValidators: true }
//   )

//   const tokenUser = createTokenUser(userUpdate)

//   attachCookiesToResponse({ res, user: tokenUser })

//   res.status(StatusCodes.OK).json({ user: tokenUser })
// }
