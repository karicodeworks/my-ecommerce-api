const {
  getAllReviews,
  updateReview,
  deleteReview,
  createReview,
  getSingleReview,
} = require('../controllers/reviewController')
const express = require('express')
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')

const router = express.Router()

router
  .route('/')
  .get(getAllReviews)
  .post([authenticateUser, authorizePermissions('user')], createReview)

router
  .route('/:id')
  .get(getSingleReview)
  .patch([authenticateUser, authorizePermissions('user')], updateReview)
  .delete([authenticateUser, authorizePermissions('user')], deleteReview)

module.exports = router
