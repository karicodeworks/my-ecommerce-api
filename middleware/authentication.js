const CustomError = require('../errors')
const { isValidToken } = require('../utils')
const Token = require('../models/Token')
const { attachCookiesToResponse } = require('../utils')

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies

  try {
    if (accessToken) {
      const payload = isValidToken(accessToken)
      req.user = payload.user
      return next()
    }
    const payload = isValidToken(refreshToken)

    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    })

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Authentication invalid.')
    }
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication invalid.')
  }

  attachCookiesToResponse({
    res,
    user: payload.user,
    refreshToken: existingToken.refreshToken,
  })

  req.user = payload.user
  next()
}

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access that route.'
      )
    }
    next()
  }
}

module.exports = {
  authenticateUser,
  authorizePermissions,
}
