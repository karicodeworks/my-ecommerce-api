const { createJWT, isValidToken, attachCookiesToResponse } = require('./jwt')
const createTokenUser = require('./createTokenUser')
const checkPermissions = require('./checkPermissions')
const sendVerificationEmail = require('./sendVerificationEmail')

module.exports = {
  createJWT,
  isValidToken,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
  sendVerificationEmail,
}
