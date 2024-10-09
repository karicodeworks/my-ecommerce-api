const express = require('express')
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')

const router = express.Router()

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/userController')

router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin', 'user'), getAllUsers)

router.route('/showMe').get(showCurrentUser)
router.route('/updateUser').post(updateUser)
router.route('/updateUserPassword').post(updateUserPassword)

router.route('/:id').get(authenticateUser, getSingleUser)

module.exports = router
