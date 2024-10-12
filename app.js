//Starting imports
const express = require('express')
require('dotenv').config()
require('express-async-errors')

//rest of imports
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

//Database connection import
const connectDB = require('./db/connect')

//middleware import
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

//routes import
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')

const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.get('/', (req, res) => {
  res.send('This is the fist ecommerce page')
})

app.get('/api/v1', (req, res) => {
  //console.log(res.cookies)
  console.log(req.signedCookies)

  res.send('This is the fist ecommerce page')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
