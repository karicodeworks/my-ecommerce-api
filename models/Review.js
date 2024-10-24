const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide product rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide a review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      require: [true, 'Please provide review comment'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  },
  { timestamps: true }
)

ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('Review', ReviewSchema)
