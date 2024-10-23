const Review = require('../models/Review')
const Product = require('../models/Product')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')
const { StatusCodes } = require('http-status-codes')

const createReview = async (req, res) => {
  const { product: productId } = req.body

  const productExists = await Product.findOne({ _id: productId })
  if (!productExists) {
    throw new CustomError.NotFoundError(
      `product with id ${productId} does not exist.`
    )
  }

  const reviewExists = await Review.findOne({
    product: productId,
    user: req.user.userId,
  })
  if (reviewExists) {
    throw new CustomError.BadRequestError(
      'The view for this product is already submitted'
    )
  }

  req.body.user = req.user.userId
  const review = await Review.create(req.body)
  res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
  res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params
  const { rating, title, comment } = req.body

  const review = await Review.findOne({ _id: reviewId })

  if (!review) {
    throw new CustomError.NotFoundError(`Not review with id ${reviewId}`)
  }

  checkPermissions(req.user, review.user)

  review.rating = rating
  review.title = title
  review.comment = comment

  await review.save()

  res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
  if (!review) {
    throw new CustomError.NotFoundError(`not review with id: ${reviewId}`)
  }

  checkPermissions(req.user, review.user)

  await review.deleteOne()

  res.status(StatusCodes.OK).json({ msg: 'Review removed successfully.' })
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
}
