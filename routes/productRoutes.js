const express = require('express')
const router = express.Router()

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')

const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  uploadImage,
} = require('../controllers/productController')

router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], createProduct)
  .get(getAllProducts)

router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('admin')], uploadImage)

router
  .route('/:id')
  .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
  .delete([authenticateUser, authorizePermissions('admin')], deleteProduct)
  .get(getSingleProduct)

module.exports = router
