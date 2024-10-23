const { required } = require('joi')
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
    color: {
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
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Product', ProductSchema)
