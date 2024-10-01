const mongoose = require('mongoose')

const Userschema = new mongoose.Schema({})

module.exports = mongoose.model('User', Userschema)
