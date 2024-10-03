const express = require('express')
const router = express.Router()

const { login, logout, register } = require('../controllers/authController')

router.get('/logout', logout).post('/login', login).post('/register', register)

module.exports = router
