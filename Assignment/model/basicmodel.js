const mongoose = require('mongoose')

// HappiJoi can be included to make sure the data is correct but for simple purpose mongoose seems fine, Monk can be used too
const usermodel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        max: 200
    },
    phonenumber: {
        type: String,
        required: true,
        max: 200
    },
    address:{
        type: String,
        required: true,
        min: 6,
        max: 2010
    },
    email:{
        type: String,
        required: true,
        min: 6,
        max: 1024
   },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('testuser', usermodel)