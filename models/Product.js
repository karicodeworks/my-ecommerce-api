const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide a product name'],
      maxlength: [50, 'Pruduct name cannot be more than 50 characters'],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [1000, 'The descrition cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      default: '/uploads/example.jpeg',
    },
    category: {
      type: String,
      required: [true, 'Please provide the product category'],
      enum: ['office', 'kitchen', 'bedroom', 'everywhere'],
    },
    company: {
      type: String,
      default: [true, 'Provide the company'],
      enum: {
        values: [
          'oraimo',
          'rashnik',
          'nunix',
          'nakumatt',
          'naivas',
          'quickmart',
        ],
        message: '{VALUE} is not supported',
      },
    },
    colors: {
      type: [String],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
})

ProductSchema.pre('deleteOne', { document: true }, async function (next) {
  try {
    const Review = mongoose.model('Review')
    await Review.deleteMany({ product: this._id })
    next()
  } catch (error) {
    next(error)
  }
})

module.exports = mongoose.model('Product', ProductSchema)
